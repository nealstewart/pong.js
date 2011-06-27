(function() {
var PLAYER_1 = 1;
var PLAYER_2 = 2;

var currentRoster;
var currentPlayer;
var countdownStarted = false;
var otherPlayerReadyToPlay = false;

var socket = io.connect('http://localhost');

(function setupSocket(socket) {
  var setPlayer = function(playerEl, userName) {
    playerEl.find('button').remove();
    playerEl.find('span').remove();

    if (userName) {
      playerEl.append('<span>'+userName+'</span>');
    } else {
      playerEl.append('<button class=join>Join</button>');
      if (currentPlayer) {
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

  socket.on('game-start', function(gameState) {
    hideCountdown();
    drawGameState(gameState);
  });

  socket.on('game-tick', function(gameState) {
    drawGameState(gameState);
  });

  socket.on('player-roster', function(info) {
    setPlayers(info);

    var twoPlayers = (currentRoster.player1 && currentRoster.player2);
    
    if (twoPlayers) { showStartButton(); }
  });

  socket.on('room-connected', function(info) {
    currentPlayer = info;
    disableJoinButtons();
  });

  socket.on('player-ready', function(playerNumber) {
    otherPlayerReadyToPlay = true;
    if (playerNumber === currentPlayer.number) {
      $('button.start').text('Ready');
    }
  });
  socket.on('game-countdown', drawCountdown);
})(socket);

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

  _.bindAll(this, 'tick');

  var paddleStartingY = canvasHeight() / 2 - (PADDLE_HEIGHT / 2);

  this.leftPlayer = { y : paddleStartingY };
  this.rightPlayer = { y : paddleStartingY };

  return this;
}

GameState.prototype = {
  tick : function() {
    this.moveBall();
    socket.emit('game-tick', this.toJSON());

    setTimeout(this.tick, 1000 / 60);
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

var currentGameState;
function startGame() {
  currentGameState = new GameState();

  socket.emit('game-start', currentGameState);

  setTimeout(currentGameState.tick, 1000 / 60);
}

function countdown() {
  var currentCount = 3;

  function _countdown() {
    socket.emit('game-countdown', currentCount);

    if (currentCount > 0) {
      setTimeout(_countdown, 1000);
    } else {
      setTimeout(startGame, 500);
    }

    currentCount -= 1;
  }

  setTimeout(_countdown, 1000);
}

function registerAsReady() {
  if (otherPlayerReadyToPlay) {
    socket.emit('player-ready');
    countdown();
  } else {
    socket.emit('player-ready');
  }
}

function joinAs(playerNumber) {
  var userName = prompt("Enter your name:");

  if (userName) $.trim(userName);
  if (!userName) {
    return;
  } else {
    var roomName = $('body').data('room-name');

    socket.emit('room-connect', {
      playerNumber : playerNumber, 
      roomName : roomName,
      userName : userName
    });
  }
}

$(function() {
  $('.player_1 .join').click(function() {
    joinAs(PLAYER_1);
  });

  $('.player_2 .join').click(function() {
    joinAs(PLAYER_2);
  });

  $('button.start').click(function() {
    registerAsReady();
  });
});
})();
