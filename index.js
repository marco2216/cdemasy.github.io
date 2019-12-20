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

    socket.on('group', function (groupName) {

        if (existsGroup(groupName)) {
            return;
        }

        groups[groupName] = true;
        const nsp = io.of('/' + groupName);

        var game = new Game(null, function (turnID, team, role) {
            nsp.emit('turn', team, role);
        });

        var board = new Board();

        nsp.on('connection', socket => setupUserSocket(nsp, socket, game, board));

        console.log('established group: ' + groupName);
    });
});

function setupUserSocket(nsp, socket, game, board) {
    socket.emit('board update', board);
    socket.emit('turn', game.team(), game.role());

    let player;

    socket.on('chat message', function (msg) {
        //console.log("chat " + msg);
        nsp.emit('chat message', msg);
    });

    socket.on('team role', function (uID, team, role) {
        player = new Player(uID, team, role);
        game.players[uID] = player; //don't use?

        socket.emit('master board', role == MASTER ? board : null);
    });

    socket.on('select square', function (uID, row, column) {
        if (!game.pTurn(player) || player.role != GUESSER) {
            console.log("received play from invalid user");
            socket.emit('board update', board);
        }
        else if (board.select(row, column)) {
            let square = board.getSquare(row, column);
            let color = square.team == Board.BLUE ? "blue" : square.team == Board.RED ? "red" : "yellow"

            game.makePlayGuesser(uID);
            nsp.emit('board update', board);
            //console.log('emitted board update');
            //console.log(color + " " +player);

            if(color != player.team){
                game.endTurn();
            }
        }
    });

    socket.on('master', function (uID, numSquares, hint) {
        if (!game.pTurn(player) || player.role != MASTER) {
            return;
        }
        else {
            game.makePlayMaster(uID, numSquares, hint);
            nsp.emit('master update', numSquares, hint);
        }
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
    }

    makePlayMaster(uID, numSquares, hint) {
        //if(!this.isPlayerTurn(uID)) return false;

        this.numSquares = numSquares;
        this.hint = hint;
        this.endTurn();
        return true;
    }

    makePlayGuesser(uID) {
        //if (!this.isPlayerTurn(uID)) return false;
        this.numSquares--;
        console.log(this.numSquares);
        if (this.numSquares == 0) this.endTurn();
        return true;
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
    constructor(userID, team, role) {
        this.userID = userID;
        this.team = team;
        this.role = role;
    }

    turnID() {
        return turns[this.team + this.role];
    }

}

