var BALL_DIAMETER = 20;
var PADDLE_HEIGHT = 50;
var PADDLE_WIDTH = 10;

var RIGHT = 1;
var LEFT = -1;

function rectanglesIntersect(firstRectangle, secondRectangle) {
  var firstRectangleTop = firstRectangle.y;
  var firstRectangleBottom = firstRectangle.y + firstRectangle.height;
  var firstRectangleLeft = firstRectangle.x;
  var firstRectangleRight = firstRectangle.x + firstRectangle.width;

  var secondRectangleTop = secondRectangle.y;
  var secondRectangleBottom = secondRectangle.y + secondRectangle.height;
  var secondRectangleLeft = secondRectangle.x;
  var secondRectangleRight = secondRectangle.x + secondRectangle.width;

  var firstOutsideSecond = ( firstRectangleLeft > secondRectangleRight || 
                             firstRectangleBottom < secondRectangleTop || 
                             firstRectangleTop > secondRectangleBottom ||
                             firstRectangleRight < secondRectangleLeft);

  return !firstOutsideSecond;
}

function GameState(initialGameState) {
  this.ballCanCollide = true;

  if (!initialGameState) {
    var xDecider = Math.floor(Math.random() * 2);
    var xDirection;
    if (xDecider === 0) {
      xDirection = LEFT;
    } else {
      xDirection = RIGHT;
    }

    var yVelocity = 3;
    var xVelocity = xDirection * 10;

    this.ball = {
      x : ( canvasWidth() / 2 - (BALL_DIAMETER / 2) ),
      y : ( canvasHeight() / 2 - (BALL_DIAMETER / 2) ),
      velocity : {
        x : xVelocity,
        y : yVelocity
      }
    };

    var paddleStartingY = canvasHeight() / 2 - (PADDLE_HEIGHT / 2);

    this.leftPlayer = {
      x : 5,
      y : paddleStartingY 
    };

    this.rightPlayer = { 
      x : canvasWidth() - PADDLE_WIDTH + 5,
      y : paddleStartingY 
    };

  } else {
    _.extend(this, initialGameState);
  }

  return this;
}

GameState.prototype = {
  ballNearSide : function() {
    return this.ball.x < 40 || this.ball.x + BALL_DIAMETER > canvasWidth() - 40;
  },

  resetBall : function() {
    this.ball.x = ( canvasWidth() / 2 - (BALL_DIAMETER / 2) );
    this.ball.y = ( canvasHeight() / 2 - (BALL_DIAMETER / 2) );
  },

  tick : function() {
    var currentMoveTime = (new Date()).getTime();
    this.millisecondsSinceLastTick = (this.lastMoveTime ? currentMoveTime - this.lastMoveTime : (1000 / 60));
    this.lastMoveTime = this.currentMoveTime;
    this.movePlayers();
    this.moveBall();
  },

  getTimeConvertedDistanceForSpeed : function(speed) {
    var distanceForTime = (this.millisecondsSinceLastTick / (1000 / 60) * speed);
    return distanceForTime;
  },

  movePlayer : function(player) {
    var playerDistance = this.getTimeConvertedDistanceForSpeed(5);
    if (player.down && player.y + PADDLE_HEIGHT < canvasHeight()) {
      player.y += playerDistance;
    } else if (player.up && player.y >= 0) {
      player.y -= playerDistance;
    } else if (player.up) {
      player.y = playerDistance;
    } else if (player.down) {
      player.y = canvasHeight() - PADDLE_HEIGHT;
    }
  },

  movePlayers : function() {
    this.movePlayer(this.rightPlayer);
    this.movePlayer(this.leftPlayer);
  },

  moveBall : function() {
    this.ball.x = this.ball.x + this.getTimeConvertedDistanceForSpeed(this.ball.velocity.x);
    this.ball.y = this.ball.y + this.getTimeConvertedDistanceForSpeed(this.ball.velocity.y);

    var leftEdge = this.ball.x,
        rightEdge = this.ball.x + BALL_DIAMETER,
        top = this.ball.y,
        bottom = this.ball.y + BALL_DIAMETER;

    if (top < 0) {
      this.ball.y = 0;
      this.ball.velocity.y = -this.ball.velocity.y;
    } else if (bottom > canvasHeight()) {
      this.ball.y = canvasHeight() - BALL_DIAMETER;
      this.ball.velocity.y = -this.ball.velocity.y;
    }

    if (leftEdge < (0 - BALL_DIAMETER)) {
      this.resetBall();
    } else if (rightEdge > canvasWidth() + BALL_DIAMETER) {
      this.resetBall();
    }

    if (this.ballCanCollide) {
      if (this.ballIntersectsWithPlayer(this.rightPlayer) || 
          this.ballIntersectsWithPlayer(this.leftPlayer)) {
        this.ball.velocity.x = -this.ball.velocity.x;

        this.ballCanCollide = false;
        this.timeBallCollided = (new Date()).getTime();
      }
    } else {
      var currentTime = (new Date()).getTime();

      if ((currentTime - this.timeBallCollided > 500)) {
        this.ballCanCollide = true;
      }
    }

  },

  ballIntersectsWithPlayer : function(player) {
    var playerRect = {
      x : player.x,
      y : player.y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    };

    var ballRect = {
      x : this.ball.x,
      y : this.ball.y,
      width: BALL_DIAMETER,
      height: BALL_DIAMETER
    };

    return rectanglesIntersect(playerRect, ballRect);
  },

  getPlayerByNumber : function(playerNumber) {
    var player;
    if (playerNumber == 1) {
      player = this.leftPlayer;
    } else if (playerNumber == 2) {
      player = this.rightPlayer;
    } else {
      throw "improper player number" + 3;
    }

    return player;
  },

  markPlayerNumberAsMoving : function(playerNumber, direction) {
    var player = this.getPlayerByNumber(playerNumber);
    player[direction] = true;
  },

  unmarkPlayerNumberAsMoving : function(playerNumber, direction) {
    var player = this.getPlayerByNumber(playerNumber);
    player[direction] = false;
  },

  toJSON : function() {
    return {
      ball: this.ball,
      leftPlayer : this.leftPlayer,
      rightPlayer : this.rightPlayer
    };
  }
};
