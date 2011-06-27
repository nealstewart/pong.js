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

/*
  ok so here's how this shit is going to work out.

  i'm going to have a collection of rooms. each room can be joined by two players.

  when you first load up the app there's a big old button that just says "start playing".

  when you click that shit it brings up prompts for you to select the name of the room you'd like to join, as well as a username.

  i'll assert uniqueness of usernames.

  Once you log in shit looks like this:

    Player 1              Player 2
    Bob                   George
    _______               _______
    |Ready|               |Ready|
    -------               -------
   _________________________________
                                  
     |             *             |


   _________________________________



   Once both players click their ready buttons, the game is underway.

   Runs to ten points. After which a player is declared the winner.

   I'm going to run the game logic on the server.

   So every game 'tick', the server is going to send the game state to the client.

   which means the client basically looks like this

   socket.on('gameTick', function(newGameState) {
     drawGameState(newGameState);
   });
    
   plus a couple handlers
    
   on keyDown for down arrow
   socket.emit('requestMove', 'down');
   on keyUp for down arrow
   socket.emit('doneMove', 'down');

   on keyDown for up arrow
   socket.emit('requestMove', "up");
   on keyUp for down arrow
   socket.emit('doneMovingDown');
  */


io.sockets.on('connection', function(socket) {
  var room;
  socket.on('room-connect', function(info) {
    var roomName = info.roomName,
        userName = info.userName,
        playerNumber = info.playerNumber;

    room = Room.findOrCreateByName(roomName);

    room.join(socket, playerNumber, userName);
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

