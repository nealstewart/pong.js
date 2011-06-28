var BALL_DIAMETER = 20;
var PADDLE_HEIGHT = 50;
var PADDLE_WIDTH = 10;

var RIGHT = 1;
var LEFT = -1;

function GameState() {
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

  this.leftPlayer = { y : paddleStartingY };
  this.rightPlayer = { y : paddleStartingY };

  return this;
}

GameState.prototype = {
  tick : function() {
    this.moveBall();
  },

  moveBall : function() {
    this.ball.x = this.ball.x + this.ball.velocity.x;
    this.ball.y = this.ball.y + this.ball.velocity.y;

    var leftEdge = this.ball.x,
        rightEdge = this.ball.x + BALL_DIAMETER,
        top = this.ball.y,
        bottom = this.ball.y + BALL_DIAMETER;

    if (leftEdge < 0) {
      this.ball.x = 0;
      this.ball.velocity.x = -this.ball.velocity.x;
    } else if (rightEdge > canvasWidth()) {
      this.ball.x = canvasWidth() - BALL_DIAMETER;
      this.ball.velocity.x = -this.ball.velocity.x;
    }

    if (top < 0) {
      this.ball.y = 0;
      this.ball.velocity.y = -this.ball.velocity.y;
    } else if (bottom > canvasHeight()) {
      this.ball.y = canvasHeight() - BALL_DIAMETER;
      this.ball.velocity.y = -this.ball.velocity.y;
    }
  },

  toJSON : function() {
    return {
      ball: this.ball,
      leftPlayer : this.leftPlayer,
      rightPlayer : this.rightPlayer
    };
  }
};
