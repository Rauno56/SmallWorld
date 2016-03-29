// global vars

var remotePlayers;
var socket;

window.onload = function()
{
    // init
    remotePlayers = [];
    socket = io.connect("http://localhost:2000/game");
    setEventHandlers();
}

function setEventHandlers()
{
    // Keyboard
    this.document.onkeydown = keyPressed;
    this.document.onkeyup = keyReleased;

    // Socket Events
    socket.on("connect", onSocketConnected);
    socket.on("you", onYou);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("message", onMessage);
    socket.on("remove player", onRemovePlayer);
    socket.on("map", onMap);
};

