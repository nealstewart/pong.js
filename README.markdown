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

plus a couple handlers

on keyDown for down arrow
    socket.emit('requestMove', 'down');
on keyUp for down arrow
    socket.emit('doneMove', 'down');

on keyDown for up arrow
    socket.emit('requestMove', "up");
on keyUp for down arrow
    socket.emit('doneMovingDown');
