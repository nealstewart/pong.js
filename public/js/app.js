(function() {

function getGameInfo() {
  var roomName = prompt("Enter the name of the game you'd like to join:");

  if (roomName) roomName.trim();
  if (!roomName) return;

  window.location = "/games/"+roomName;
}

$(function() {
  var button = $('#the_button');
  button.click(function(evt) {
    evt.preventDefault();

    getGameInfo();
  });
});

})();
