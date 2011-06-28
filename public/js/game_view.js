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

  _.bindAll(this,
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
}

GameView.prototype = {
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

  showStartButton : function() {
    var buttonEl = $('button.start').text('Start');
    buttonEl.show();
  },

  setPlayer : function(playerEl, userName) {
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
