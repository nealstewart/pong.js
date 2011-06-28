(function() {
var GameModel = function() {
  this.socket = io.connect('http://localhost');

  var roomName = $('body').data('room-name');
  this.socket.emit('room-observer', roomName);

  this.otherPlayerReadyToPlay = false;

  _.bindAll(this, 'tick', 'startGame');

  this.setupSocket(this.socket);
};

GameModel.prototype = {
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

      game.currentRoster = playerInfo;
    };

    this.socket.on('game-start', function(gameState) {
      game.emit('start', gameState);
    });

    this.socket.on('game-tick', function(gameState) {
      game.emit('tick', gameState);
    });

    this.socket.on('player-roster', function(currentRoster) {
      setPlayers(currentRoster);

      var twoPlayers = (currentRoster.player1 && currentRoster.player2);
      
      if (twoPlayers) { 
        game.emit('two-players');
      }
    });

    this.socket.on('room-connected', function(info) {
      game.currentPlayer = info;

      game.emit('current-user-joined');
    });

    this.socket.on('player-ready', function(playerNumber) {
      game.otherPlayerReadyToPlay = true;
      if (playerNumber === game.currentPlayer.number) {
        $('button.start').text('Ready');
      }
    });

    this.socket.on('game-countdown', function(currentCount) {
      game.emit('countdown', currentCount);
    });
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

window.GameModel = GameModel;
_.extend(GameModel.prototype, new io.EventEmitter());
})();
