var socket = io();
var name;
var userID;

socket.on("userID", id => {
    userID = id;
    console.log("userID is "+userID);
});

const turnNames = 

$('#chatForm').submit(function (e) {
    e.preventDefault(); // prevents page reloading
    let msg = $('#m').val();
    if (msg == "") return;

    socket.emit('chat message', `${name}: ${msg}`);
    $('#m').val('');
    return false;
});

$('#groupForm').submit(function (e) {
    e.preventDefault(); // prevents page reloading
    let group = $('#groupString').val();
    name = $('#userName').val();
    if (group == "" || name == "") return;

    io().emit('group', group, name);
    socket.removeAllListeners();
    
    setTimeout(function(){
        socket = io('/'+group);

        //socket.emit('team role', userID, 'red', 'master');
        assignTeamRoleListener(socket, "#redmaster", "red", "master");
        assignTeamRoleListener(socket, "#redguesser", "red", "guesser");
        assignTeamRoleListener(socket, "#bluemaster", "blue", "master");
        assignTeamRoleListener(socket, "#blueguesser", "blue", "guesser");

        $("#masterForm").submit(function(e){
            e.preventDefault();
            let hint = $("#hint").val();
            let numSquares = parseInt($("#numSquares").val());
            console.log(hint+numSquares);
            if(hint != "" && numSquares) {
                socket.emit("master", userID, numSquares, hint);
                console.log("sent master");
            }
        });

        socket.on('chat message', function (msg) {
            $('#messages').append($('<li>').text(msg));
        });

        socket.on('players', function(players){
            console.log(players);
            playersList.length = 0;
            playersList.push(...players);
            window.updatePlayers();
        });

        socket.on('board update', function (msg) {
            if (!msg) {
                socket.emit('board update', board);
            } 
            else{
                board.update_board(msg);
                window.updateBoard();
            }

        });

        socket.on('master board', function (boardObject) {
            if(boardObject){
                var board = new Board();
                board.update_board(boardObject);

                board.selectAll();

                ReactDOM.render(<BoardView board={board}></BoardView>,
                    document.getElementById("masterBoardContainer"));
            }
            else{
                ReactDOM.unmountComponentAtNode(document.getElementById("masterBoardContainer"));
            }
            
        });

        socket.on('master update', function (numSquares, hint) {
            $("#hint").val(hint);
            $("#numSquares").val(numSquares);
        });

        socket.on('turn', function (team, role) {
            $("#turn").html(team + " " + role);
            $("#turn").css("color", team);
        });

        console.log("joined " + group)
        $('#game').css("display", "flex");
        $('#lobby').css("display", "none");
        
    }, 500);

    return false;
});

function assignTeamRoleListener(socket, buttonID, team, role){
    $(buttonID).click(() => {
        socket.emit('team role', userID, team, role) 
        console.log("sent team role " + team + role);
    });
}
