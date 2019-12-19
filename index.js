var path = require('path');
var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


var htmlPath = path.join(__dirname, 'content');
app.use(express.static(htmlPath));

var boards = {};
var groups = {};

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('group', function (groupName) {
        if(groups[groupName]) return;
        groups[groupName] = true;

        const nsp = io.of('/'+groupName);
        nsp.on('connection', function(socket){
            if(boards[groupName]) nsp.emit('board update', boards[groupName]);

            socket.on('chat message', function (msg) {
                console.log("chat "+msg);
                nsp.emit('chat message', msg);
            });

            socket.on('board update', function (board) {
                boards[groupName] = board;
                nsp.emit('board update', board);
                console.log('emitted board update');
            });
        });
        console.log('established group ' + groupName);
    });
});

server.listen(3000, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});