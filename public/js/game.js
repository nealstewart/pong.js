var PLAYER_1 = 1;
var PLAYER_2 = 2;

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

var countdownStarted = false;
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
  var game = new GameModel();

  $('.player_1').delegate('.join', 'click', function() {
    game.joinAs(PLAYER_1);
  });

  $('.player_2').delegate('.join', 'click', function() {
    game.joinAs(PLAYER_2);
  });

  $('button.start').click(function() {
    game.registerAsReady();
  });
});
