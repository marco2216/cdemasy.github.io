var fs = require("fs");
var wordList = fs.readFileSync("content/words.txt").toString().split(/\r?\n/);

var squareTeamList = [];

class Square {
  constructor(team, word) {
    this.team = team;
    this.word = word;
    this.selected = false;
  }
}

class Board {
  constructor() {
    squareTeamList = [];

    for (var i = 0; i < 10; i++) 
    {
      squareTeamList.push(Board.RED);
      squareTeamList.push(Board.BLUE);
    }

    for (var i = 0; i < 5; i++) 
    {
      squareTeamList.push(0);
    }
    console.log(squareTeamList);
    
    var p1, p2 = { team: Board.RED };
    var p3, p4 = { team: Board.BLUE };
    this.score = [];
    this.score[Board.RED] = 0;
    this.score[Board.BLUE] = 0;
    this.size = 5;
    this.players = ["p1", "p2", "p3", "p4"];
    this.current_player = this.players[0];
    this.current_team = "red";
    this.board = this.create_board(this.size);
  }

  update_board(from){
    Object.assign(this, from);
  }

  create_board(size) {
    shuffle(wordList);
    shuffle(squareTeamList);
    var m = [];
    for (var i = 0; i < size; i++) {
      m[i] = [];
      for (var j = 0; j < size; j++) {
        m[i][j] = new Square(squareTeamList[i * size + j], wordList[i * size + j]);
      }
    }
    return m;
  }

  select(i, j) {
    var sq = this.board[i][j];
    if (!sq.selected) {
      sq.selected = true;
      this.score[sq.team]++;
      
      return true;
    }
    return false;
  }

  getSquare(i, j) {
    return this.board[i][j];
  }
}

Board.RED = 1;
Board.BLUE = 2;

module.exports = Board;

/*
//
//
//MAIN
//
//
var testBoard = new Board();


//
//
//LOGGING
//
//
testBoard.board.forEach(function(arr, index1){
  arr.forEach(function(square, index2){
    console.log("Square " + index1+index2 + ": " + square.word + " " + square.team);
  })
});
*/



//
//
//UTILITY
//
//
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};
