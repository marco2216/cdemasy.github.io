var socket = io();

$('form').submit(function (e) {
    e.preventDefault(); // prevents page reloading
    let msg = $('#m').val();
    if (msg == "") return;

    socket.emit('chat message', msg);
    $('#m').val('');
    return false;
});

socket.on('chat message', function (msg) {
    $('#messages').append($('<li>').text(msg));
});

socket.on('board update', function (msg) {
    board.update_board(msg);
    window.updateBoard();
});
