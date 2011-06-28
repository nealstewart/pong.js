var _ = require('underscore');
var rooms = {};

var Room = function(name) { 
  this.name = name;
  console.log("constructor has", name);
  this.player1 = null;
  this.player2 = null;

  this.observers = [];
};

_.extend(Room, {
  findOrCreateByName : function(roomName) {
    var room = rooms[roomName];

    if (!room) {
      room = rooms[roomName] = new Room(roomName);
    }

    return room;
  }
});

exports.Room = Room;

Room.prototype = {
  addObserver : function(socket) {
    this.observers.push(socket);
  },

  join : function(socket, playerNumber, userName) {
    if (!_.include([1, 2], playerNumber)) throw "improper player number";
    this.observers = _.without(this.observers, socket);

    var playerWhoJoined = this["player"+playerNumber] = {
      socket : socket,
      userName : userName,
      number : playerNumber
    };

    this.emitPlayers(playerWhoJoined);

    playerWhoJoined.socket.emit('room-connected', {
      number : playerWhoJoined.number,
      userName : playerWhoJoined.userName
    });
  },

  emitCountdown : function(currentCount) {
    this.emit('game-countdown', currentCount);
  },

  emitGameStart : function(gameState) {
    this.emit('game-start', gameState);
  },

  emitGameSync : function(gameState) {
    this.emit('game-sync', gameState);
  },

  emitPlayers : function(playerWhoJoined) {
    var player1UserName;
    var player2UserName;

    if (this.player1) { player1UserName = this.player1.userName; }
    if (this.player2) { player2UserName = this.player2.userName; }

    this.emit('player-roster', {
      player1 : player1UserName,
      player2 : player2UserName 
    });
  },

  emit : function(channel, message) {
    if (this.player1) { 
      this.player1.socket.emit(channel, message); 
    }

    if (this.player2) { 
      this.player2.socket.emit(channel, message); 
    }

    _.each(this.observers, function(socket) {
      socket.emit(channel, message);
    });
  },

  socketDisconnected : function(socket) {
    var disconnectedPlayer;

    if (this.player1 && this.player1.socket == socket) {
      this.player1 = null;
    } else if (this.player2 && this.player2.socket == socket) {
      this.player2 = null;
    } else {
      this.observers = _.without(this.observers, socket);
    }



    this.emitPlayers();
  },

  getPlayerForSocket : function(socket) {
    if (this.player1 && this.player1.socket == socket) {
      return this.player1;
    } else if (this.player2 && this.player2.socket == socket) {
      return this.player2;
    }
  },

  registerPlayerAsReady : function(socket) {
    var player = this.getPlayerForSocket(socket);

    this.emit('player-ready', player.number);
  },

  beginMove : function(socket, direction) {
    var player = this.getPlayerForSocket(socket);
    this.emit('game-move', {
      playerNumber : player.number,
      direction : direction
    });
  },

  endMove : function(socket, direction) {
    var player = this.getPlayerForSocket(socket);
    this.emit('game-endmove', {
      playerNumber : player.number,
      direction : direction
    });
  }
};

