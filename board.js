var Board = function() {
  var p1, p2 = {team:Board.RED};
  var p3, p4 = {team:Board.BLUE};

  this.size = 5;
  this.players = ["p1", "p2", "p3", "p4"];
  this.current_player = this.players[0];
  this.current_team = "red";
  this.board = this.create_board(size);

  for (var i = 0; i < 10; i++) {
      squareTeamList.add(Board.RED);
      squareTeamList.add(Board.BLUE);
  }
  for (var i = 0; i < 5; i++) {
      squareTeamList.add(0);
  }

};

var testBoard = new Board();
testBoard.board.forEach(function(item){
  console.log(item.team + " " + item.word);
});

Board.RED = 1;
Board.BLUE = 2;
var squareTeamList = [];
var wordList = [];
$.get("words.txt", function(data) {
  wordList = data.split(/\r?\n/);
}, "text");

var Square = function(team, word){
  this.team = team;
  this.word = word;
  this.clicked = false;
};

Board.prototype.create_board = function(size) {
  shuffle(wordList);
  shuffle(squareTeamList);
  var m = [];
  for (var i = 0; i < size; i++) {
    m[i] = [];
    for (var j = 0; j < size; j++)
      m[i][j] = new Square(squareTeamList[i*size+j], wordList[i*size+j]);
  }
  return m;

};








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
