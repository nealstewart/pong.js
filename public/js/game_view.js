var PLAYER_1 = 1;
var PLAYER_2 = 2;

function GameView() {
  this.game = new GameModel();
  var game = this.game;
  var that = this;

  $('.player_1').delegate('.join', 'click', function() {
    that.joinAs(PLAYER_1);
  });

  $('.player_2').delegate('.join', 'click', function() {
    that.joinAs(PLAYER_2);
  });

  $('button.start').click(function() {
    game.registerAsReady();
  });

  $(document).keydown(function(evt) {
    switch (evt.keyCode) {
      case 40 :
        game.requestMove('down');
        break;

      case 38 :
        game.requestMove('up');
        break;

      default :
        break;
    }
  });

  $(document).keyup(function(evt) {
    switch (evt.keyCode) {
      case 40 :
        game.requestEndMove('down');
        break;

      case 38 :
        game.requestEndMove('up');
        break;

      default :
        break;
    }
  });

  _.bindAll(this,
            'reset',
            'setPlayers',
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
  this.game.on('player-roster', this.setPlayers);
  this.game.on('reset', this.reset);
  this.game.on('connected', this.connected);
}

GameView.prototype = {
  clearCanvas : function() {
    var canvas = $('canvas').get(0);
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    var w = canvas.width;
    canvas.width = 1;
    canvas.width = w;
  },

  connected : function() {
    $('.connecting_notifier').hide();
    $('.game_container').show();
  },

  reset : function() {
    debugger;
    if (!this.context) {
      var canvasEl = $('canvas').get(0);
      this.context = canvasEl.getContext('2d');
    }

    this.clearCanvas();
    this.hideCountdown();
    this.hideStartButton();

  },
  joinAs : function(playerNumber) {
    var userName = prompt("Enter your name:");

    if (userName) $.trim(userName);

    if (!userName) {
      return;

    } else {
      var roomName = $('body').data('room-name');

      this.game.join({
        playerNumber : playerNumber, 
        roomName : roomName,
        userName : userName
      });
    }
  },
  disableJoinButtons : function() {
    $('.players button').attr('disabled', 'disabled');
  },

  hideStartButton : function() {
    $('button.start').hide();
  },

  showStartButton : function() {
    var buttonEl = $('button.start').text('Start');
    buttonEl.show();
  },

  setPlayer : function(playerEl, userName) {
    playerEl.find('button').remove();
    playerEl.find('span').remove();
    playerEl.find('.score').remove();

    if (userName) {
      playerEl.append('<span>'+userName+'</span><div class=score>0</div>');
    } else {
      playerEl.append('<button class=join>Join</button>');
      if (this.game.currentPlayer) {
        playerEl.find('button').attr('disabled', 'disabled');
      }
    }
  },

  setPlayers : function(playerInfo) {
    var player1El = $('.player_1');
    var player2El = $('.player_2');

    this.setPlayer(player1El, playerInfo.player1);
    this.setPlayer(player2El, playerInfo.player2);

    this.game.currentRoster = playerInfo;
  },

  hideCountdown : function() {
    $('.countdown').hide();
  },

  drawGameState : function(gameState) {
    if (!this.context) {
      var canvasEl = $('canvas').get(0);
      this.context = canvasEl.getContext('2d');
    }

    this.clearCanvas();
    if (!this.game.stopped) {
      this.drawPlayers(gameState);
      this.drawBall(gameState);
      this.drawScore(gameState);
    }
  },

  drawScore : function(gameState) {
    $('.player_1 .score').text(gameState.leftPlayer.score);
    $('.player_2 .score').text(gameState.rightPlayer.score);
  },

  drawPlayers : function(gameState) {
    this.drawPlayer(
      5, 
      gameState.leftPlayer.y);

    this.drawPlayer(
      canvasWidth() - 5 - PADDLE_WIDTH, 
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
