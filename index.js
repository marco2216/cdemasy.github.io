var path = require('path');
var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


var htmlPath = path.join(__dirname, 'content');
app.use(express.static(htmlPath));

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('board update', function (msg) {
        console.log('message: ' + msg);
        io.emit('board update', msg);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

server.listen(3000, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});