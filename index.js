var path = require('path');
var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

const Board = require("./board.js");

var htmlPath = path.join(__dirname, 'content');
app.use(express.static(htmlPath));

var userCounter = 0;

var groups = {};
var existsGroup = (groupName) => groups[groupName] ? true : false

io.on('connection', function (socket) {
    console.log('a user connected');
    const userID = userCounter++;
    socket.emit("userID", userID);

    socket.on('group', function (groupName, userName) {

        if (existsGroup(groupName)) {
            return;
        }

        groups[groupName] = true;
        const nsp = io.of('/' + groupName);

        var game = new Game(null, function (turnID, team, role) {
            nsp.emit('turn', turnID, team, role);
            if (role == MASTER) nsp.emit('master update', 0, "");
        });

        nsp.on('connection', socket => onUserJoinsGroup(nsp, socket, game, game.board));

        console.log('established group: ' + groupName);
    });
});

function onUserJoinsGroup(nsp, socket, game, board) {
    userTicker++;
    let uname;
    socket.on('username', name => {
        uname = name;
        if (Object.values(game.players).find(p => p.username == uname)) uname = uname + userCounter;
        game.players[socket.id] = new Player(-1, uname, RED, MASTER);
    }); 

    socket.emit('players', Object.values(game.players));
    socket.emit('board update', board);
    socket.emit('turn', game.turnID, game.team(), game.role());
    socket.emit('master update', game.numSquares, game.hint);


    socket.on('chat message', function (msg) {
        nsp.emit('chat message', `${uname}: ${msg}`);
    });

    socket.on('team role', function (uID, team, role) {
        let player = game.players[socket.id];
        player.team = team;
        player.role = role;


        socket.emit('team role', player.turnID(), team, role);
        socket.emit('turn', game.turnID, game.team(), game.role());
        nsp.emit('players', Object.values(game.players));
        socket.emit('master board', role == MASTER ? board : null);
    });

    socket.on('select square', function (uID, row, column) {
        if (game.makePlayGuesser(game.players[socket.id], row, column)) {
            nsp.emit('board update', board);
            nsp.emit('master update', game.numSquares, game.hint);
        }
        else socket.emit('board update', board);
    });

    socket.on('master', function (uID, numSquares, hint) {
        if (game.makePlayMaster(game.players[socket.id], numSquares, hint)) 
            nsp.emit('master update', numSquares, hint);
    });

    socket.on('disconnect', () => {
        delete game.players[socket.id];
        nsp.emit('players', Object.values(game.players));
    });



};

server.listen(3000, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});



const RED = "red", BLUE = "blue";
const GUESSER = "guesser", MASTER = "master";

var turns = {};
turns[RED + MASTER] = 0;
turns[RED + GUESSER] = 1;
turns[BLUE + MASTER] = 2;
turns[BLUE + GUESSER] = 3;


class Game {
    constructor(players, onNewTurn) {
        this.turnID = 0;
        this.players = players ? players : {};
        this.onNewTurn = onNewTurn;
        this.board = new Board();
        this.numSquares = 0;
        this.hint = "";
    }

    makePlayMaster(player, numSquares, hint) {
        if (!this.pTurn(player) || player.role != MASTER) {
            return false;
        }
        else {
            this.numSquares = numSquares;
            this.hint = hint;
            this.endTurn();
            return true;
        }
    }

    makePlayGuesser(player, row, column) {
        if (!this.pTurn(player) || player.role != GUESSER) {
            console.log("received play from invalid user");
            return false;
        }
        else if (this.board.select(row, column)) {
            let square = this.board.getSquare(row, column);
            let color = square.team == Board.BLUE ? "blue" : square.team == Board.RED ? "red" : "yellow"

            this.numSquares--;

            if (color != player.team || this.numSquares == 0) {
                this.endTurn();
            }
            return true;
        }
    }

    endTurn() {
        this.incrementTurn();
        this.onNewTurn(this.turnID, this.team(), this.role());
    }

    pTurn(player) {
        return player.turnID() == this.turnID;
    }

    incrementTurn() {
        this.turnID = this.turnID == 3 ? 0 : ++this.turnID;
        console.log("turn is now " + this.turnID);
    }

    team(){
        return this.turnID < 2 ? RED : BLUE;
    }

    role(){
        return this.turnID % 2 == 0 ? MASTER : GUESSER;
    }
}

class Player {
    constructor(userID, username, team, role) {
        this.userID = userID;
        this.username = username;
        this.team = team;
        this.role = role;
    }

    turnID() {
        return turns[this.team + this.role];
    }

}

