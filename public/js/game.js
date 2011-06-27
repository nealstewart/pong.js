(function() {
var PLAYER_1 = 1;
var PLAYER_2 = 2;

var currentPlayer;

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
  };

  socket.on('player-roster', function(info) {
    setPlayers(info);
  });

  socket.on('room-connected', function(info) {
    this.currentPlayer = info;
    disableJoinButtons();
  });
})(socket);

function disableJoinButtons() {
  $('.players button').attr('disabled', 'disabled');
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
});
})();
