var GRID_SIZE = 1000;

class WordSquare extends React.Component{
    constructor(props){
        super(props);
        this.state = {selected: false};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.board.select(this.props.row, this.props.col)){
            this.setState({selected: true});
            this.props.onPlay();
        }
    }
    render() {
        var style = {
            top: this.props.row * GRID_SIZE,
            left: this.props.col * GRID_SIZE,
            fontSize: 25,
            padding: 5,
            height: 100,
            width: 200,
            color: this.state.selected ? this.props.color : null
        };

        var classes = "wordsquare";
        if (this.props.color != Board.EMPTY)
            classes += this.props.color;

        return (
            <button onClick={this.handleClick} className={classes}
              style={style}>{this.props.board.getSquare(this.props.row, this.props.col).word}</button>
        );
    }
}

class BoardView extends React.Component{
    render() {
        var squares = [];
        for (var i = 0; i < this.props.board.size; i++)
            for (var j = 0; j < this.props.board.size; j++)
                squares.push(<WordSquare
                    board={this.props.board}
                    color={this.props.board.getSquare(i,j).team == Board.BLUE ? "blue"
                        : this.props.board.getSquare(i,j).team == Board.RED ? "red" : "DarkKhaki"}
                    row={i}
                    col={j}
                    onPlay={this.props.onPlay}
                />);
        var style = {
            width: GRID_SIZE,
            height: GRID_SIZE
        };
        return <div style={style} id="board">{squares}</div>
    }
}

var board = new Board();

class ScoreCounter extends React.Component{
    render(){
        return(
            <font size="25" color={this.props.color}> {this.props.board.score[this.props.team]} </font>
        )
    }

}

class ContainerView extends React.Component{
  constructor(props){
    super(props);
    this.state = {'board': this.props.board};
  }

  onBoardUpdate() {
      this.setState({"board": this.props.board});
  }
  render() {
        return (
            <div>
                <ScoreCounter board={this.state.board} team={Board.RED} color="red" id="scoreCounterRed" />
                <ScoreCounter board={this.state.board} team={Board.BLUE} color="blue" id="scoreCounterBlue" />
                <BoardView board={this.state.board}
                    onPlay={this.onBoardUpdate.bind(this)} />
            </div>
        )
    }
}

ReactDOM.render(
    <ContainerView board={board} />,
    document.getElementById('main')
);
