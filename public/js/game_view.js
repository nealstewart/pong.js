var PLAYER_1 = 1;
var PLAYER_2 = 2;

function GameView() {
  this.game = new GameModel();
  var game = this.game;

  $('.player_1').delegate('.join', 'click', function() {
    game.joinAs(PLAYER_1);
  });

  $('.player_2').delegate('.join', 'click', function() {
    game.joinAs(PLAYER_2);
  });

  $('button.start').click(function() {
    game.registerAsReady();
  });

  _.bindAll(this,
            'drawGameState',
            'hideCountdown',
            'showStartButton',
            'disableJoinButtons',
            'drawCountdown');

  this.game.on('countdown', this.drawCountdown);
  this.game.on('two-players', this.showStartButton);
  this.game.on('current-user-joined', this.disableJoinButtons);
  this.game.on('start', this.drawGameState);
  this.game.on('start', this.hideCountdown);
  this.game.on('tick', this.drawGameState);
}

GameView.prototype = {
  disableJoinButtons : function() {
    $('.players button').attr('disabled', 'disabled');
  },

  showStartButton : function() {
    var buttonEl = $('button.start').text('Start');
    buttonEl.show();
  },

  hideCountdown : function() {
    $('.countdown').hide();
  },

  drawGameState : function(gameState) {
    if (!this.context) {
      var canvasEl = $('canvas').get(0);
      this.context = canvasEl.getContext('2d');
    }

    this.context.clearRect(0, 0, canvasWidth(), canvasHeight());

    this.drawPlayers(gameState);
    this.drawBall(gameState);
  },

  drawPlayers : function(gameState) {
    this.drawPlayer(
      5, 
      gameState.leftPlayer.y);

    this.drawPlayer(
      canvasWidth() - 5 - PADDLE_WIDTH / 2, 
      gameState.rightPlayer.y);
  },

  drawPlayer : function(x, y) {
    this.context.fillStyle = '#FFFFFF';
    this.context.fillRect(
      x,
      y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT);
  },

  drawBall : function(gameState) {
    this.context.strokeStyle = '#FFFFFF';
    this.context.fillStyle = '#FFFFFF';
    this.context.beginPath();
    this.context.arc(
      gameState.ball.x + BALL_DIAMETER / 2,
      gameState.ball.y + BALL_DIAMETER / 2,
      BALL_DIAMETER / 2,
      0,
      Math.PI*2,
      true);
      this.context.closePath();
      this.context.stroke();
      this.context.fill();
  },

  drawCountdown : function(currentCount) {
    if (!this.countdownStarted) {
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
};

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
