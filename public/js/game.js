(function() {
var PLAYER_1 = 1;
var PLAYER_2 = 2;

var currentRoster;
var currentPlayer;
var countdownStarted = false;
var otherPlayerReadyToPlay = false;

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
    x : canvasWidth() / 2 - (BALL_DIAMETER / 2),
    y : canvasHeight() / 2 - (BALL_DIAMETER / 2),
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

var Game = function() {
  this.socket = io.connect('http://localhost');
  this.otherPlayerReadyToPlay = false;

  _.bindAll(this, 'tick', 'startGame');

  this.setupSocket(this.socket);
};

Game.prototype = {
  startGame : function() {
    this.gameState = new GameState();
    this.socket.emit('game-start', this.gameState);

    setTimeout(this.tick, 1000 / 60);
  },

  tick : function() {
    this.socket.emit('game-tick', this.gameState.toJSON());

    this.gameState.tick();

    setTimeout(this.tick, 1000 / 60);
  },

  setupSocket : function(socket) {
    var game = this; 

    var setPlayer = function(playerEl, userName) {
      playerEl.find('button').remove();
      playerEl.find('span').remove();

      if (userName) {
        playerEl.append('<span>'+userName+'</span>');
      } else {
        playerEl.append('<button class=join>Join</button>');
        if (game.currentPlayer) {
          playerEl.find('button').attr('disabled', 'disabled');
        }
      }
    };

    var setPlayers = function(playerInfo) {
      var player1El = $('.player_1');
      var player2El = $('.player_2');

      setPlayer(player1El, playerInfo.player1);
      setPlayer(player2El, playerInfo.player2);

      currentRoster = playerInfo;
    };

    this.socket.on('game-start', function(gameState) {
      hideCountdown();
      drawGameState(gameState);
    });

    this.socket.on('game-tick', function(gameState) {
      drawGameState(gameState);
    });

    this.socket.on('player-roster', function(info) {
      setPlayers(info);

      var twoPlayers = (currentRoster.player1 && currentRoster.player2);
      
      if (twoPlayers) { showStartButton(); }
    });

    this.socket.on('room-connected', function(info) {
      game.currentPlayer = info;
      disableJoinButtons();
    });

    this.socket.on('player-ready', function(playerNumber) {
      game.otherPlayerReadyToPlay = true;
      if (playerNumber === game.currentPlayer.number) {
        $('button.start').text('Ready');
      }
    });

    this.socket.on('game-countdown', drawCountdown);
  },

  countdown : function() {
    var currentCount = 3;
    console.log("countdown was called");

    var _countdown = function() {
      console.log("_countdown was called");
      debugger;
      this.socket.emit('game-countdown', currentCount);

      if (currentCount > 0) {
        setTimeout(_countdown, 1000);
      } else {
        setTimeout(this.startGame, 500);
      }

      currentCount -= 1;
    };

    _countdown = _.bind(_countdown, this);

    setTimeout(_countdown, 1000);
  },

  registerAsReady : function() {
    if (this.otherPlayerReadyToPlay) {
      this.socket.emit('player-ready');
      this.countdown();
    } else {
      this.socket.emit('player-ready');
    }
  },

  joinAs : function(playerNumber) {
    var userName = prompt("Enter your name:");

    if (userName) $.trim(userName);
    if (!userName) {
      return;
    } else {
      var roomName = $('body').data('room-name');

      this.socket.emit('room-connect', {
        playerNumber : playerNumber, 
        roomName : roomName,
        userName : userName
      });
    }
  }
};


function disableJoinButtons() {
  $('.players button').attr('disabled', 'disabled');
}

function showStartButton() {
  var buttonEl = $('button.start').text('Start');
  buttonEl.show();
}

function hideCountdown() {
  $('.countdown').hide();
}

var context;
function drawGameState(gameState) {
  if (!context) {
    var canvasEl = $('canvas').get(0);
    context = canvasEl.getContext('2d');
  }

  context.clearRect(0, 0, canvasWidth(), canvasHeight());

  drawPlayers(gameState);
  drawBall(gameState);
}

function drawPlayers(gameState) {
  drawPlayer(
    5, 
    gameState.leftPlayer.y);

  drawPlayer(
    canvasWidth() - 5 - PADDLE_WIDTH / 2, 
    gameState.rightPlayer.y);
}

function drawPlayer(x, y) {
  context.fillStyle = '#FFFFFF';
  context.fillRect(
    x,
    y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT);
}

function drawBall(gameState) {
  context.strokeStyle = '#FFFFFF';
  context.fillStyle = '#FFFFFF';
  context.beginPath();
  context.arc(
    gameState.ball.x + BALL_DIAMETER / 2,
    gameState.ball.y + BALL_DIAMETER / 2,
    BALL_DIAMETER / 2,
    0,
    Math.PI*2,
    true);
  context.closePath();
  context.stroke();
  context.fill();
}

function drawCountdown(currentCount) {
  if (!countdownStarted) {
    var startButton = $('button.start');
    startButton.hide();
  }

  countdownStarted = true;

  var countdownEl = $('.countdown');

  if (currentCount === 0) {
    countdownEl.text("Go!");
  } else {
    countdownEl.text(currentCount);
    countdownEl.show();
  }
}

var BALL_DIAMETER = 20;
var PADDLE_HEIGHT = 50;
var PADDLE_WIDTH = 10;

var RIGHT = 1;
var LEFT = -1;

function canvasHeight() {
  var canvasEl = $('canvas');
  var height = canvasEl.height(); 

  canvasHeight = function() {
    return height;
  };

  return height;
}

function canvasWidth() {
  var canvasEl = $('canvas');
  var width = canvasEl.width(); 

  canvasWidth = function() {
    return width;
  };

  return width;
}

$(function() {
  var game = new Game();

  $('.player_1 .join').click(function() {
    game.joinAs(PLAYER_1);
  });

  $('.player_2 .join').click(function() {
    game.joinAs(PLAYER_2);
  });

  $('button.start').click(function() {
    game.registerAsReady();
  });
});
})();
