var express = require('express'),
    _ = require('underscore');

var app = express.createServer(express.logger());
var publicDirname = __dirname + "/public";

app.use(express['static'](publicDirname)); // annoying JSLint error.
app.set('view engine', 'jade');
app.set('view options', {
  layout : false
});

var io = require('socket.io').listen(app);
var Room = require('room').Room;

io.sockets.on('connection', function(socket) {
  var room;
  socket.on('room-observer', function(roomName) {
    room = Room.findOrCreateByName(roomName);
    room.addObserver(socket);
  });
  socket.on('room-connect', function(info) {
    var roomName = info.roomName,
        userName = info.userName,
        playerNumber = info.playerNumber;

    room = Room.findOrCreateByName(roomName);

    room.join(socket, playerNumber, userName);
  });

  socket.on('player-ready', function() {
    room.registerPlayerAsReady(socket);
  });

  socket.on('game-countdown', function(currentCount) {
    room.emitCountdown(currentCount);
  });

  socket.on('game-start', function(gameState) {
    room.emitGameStart(gameState);
  });

  socket.on('game-tick', function(gameState) {
    room.emitGameTick(gameState);
  });

  socket.on('game-move', function(direction) {
    room.beginMove(socket, direction);
  });

  socket.on('game-endmove', function(direction) {
    room.endMove(socket, direction);
  });

  socket.on('disconnect', function() {
    if (room) { room.socketDisconnected(socket); }
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});

app.get("/games/:roomName", function(req, res) {
  var roomName = req.params.roomName;

  var room = Room.findOrCreateByName(roomName);
  res.render('games/show.html.jade', {
    room : room
  });
});

