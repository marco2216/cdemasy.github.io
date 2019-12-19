var socket = io();
var room;

$('#chatForm').submit(function (e) {
    e.preventDefault(); // prevents page reloading
    let msg = $('#m').val();
    if (msg == "") return;

    socket.emit('chat message', msg);
    $('#m').val('');
    return false;
});

$('#groupForm').submit(function (e) {
    e.preventDefault(); // prevents page reloading
    let group = $('#groupString').val();
    if (group == "") return;

    io().emit('group', group);
    socket.removeAllListeners();
    socket = io('/'+group);

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('board update', function (msg) {
        board.update_board(msg);
        window.updateBoard();
    });

    return false;
});
