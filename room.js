var _ = require('underscore');
var rooms = {};

var Room = function(name) { 
  this.name = name;
  console.log("constructor has", name);
  this.player1 = null;
  this.player2 = null;
};

Room.prototype = {
  join : function(socket, playerNumber, userName) {
    if (!_.include([1, 2], playerNumber)) throw "improper player number";

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
    if (this.player1) { this.player1.socket.emit(channel, message); }
    if (this.player2) { this.player2.socket.emit(channel, message); }
  },

  socketDisconnected : function(socket) {
    var disconnectedPlayer;
    if (this.player1 && this.player1.socket == socket) {
      this.player1 = null;
    } else if (this.player2 && this.player2.socket == socket) {
      this.player2 = null;
    }

    this.emitPlayers();
  }
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
