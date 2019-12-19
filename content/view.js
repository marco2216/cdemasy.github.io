const GRID_SIZE = 1000;

class WordSquare extends React.Component{
    constructor(props){
        super(props);
        this.state = { selected: props.selected };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.board.select(this.props.row, this.props.col)){
            this.setState({selected: true});
            this.props.onPlay();
        }
    }

    componentDidUpdate(prevProps){
        if(this.state.selected != this.props.selected) this.setState({ selected: this.props.selected })
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
              style={style}>{this.props.word}</button>
        );
    }
}

class BoardView extends React.Component{
    render() {
        let squares = []
        for (var i = 0; i < this.props.board.size; i++)
            for (var j = 0; j < this.props.board.size; j++) 
            {
                let square = this.props.board.getSquare(i, j);

                squares.push(<WordSquare key={i + "" + j}
                    //select={() => this.props.board.select(i, j)}
                    board={this.props.board}
                    row={i}
                    col={j}
                    color={square.team == Board.BLUE ? "blue" : square.team == Board.RED ? "red" : "DarkKhaki"}
                    selected={square.selected}
                    word={square.word}
                    onPlay={this.props.onPlay}
                />);
            }

        let style = {
            width: GRID_SIZE,
        };

        return <div style={style} id="board">{squares}</div>
    }
}

class ScoreCounter extends React.Component{
    render(){
        return(
            <font size="25" color={this.props.color}> {this.props.board.score[this.props.team]} </font>
        )
    }

}

class ChatBox extends React.Component{
    render(){
        return(
            <div>
                <ul id="messages"></ul>
                <form id="chatForm" action="">
                    <input id="m" autoComplete="off" /><button>Send</button>
                </form>
            </div>
        )
    }
}

class ContainerView extends React.Component{
  constructor(props){
    super(props);
    this.state = {'board': this.props.board};
    window.updateBoard = this.onBoardUpdate.bind(this);
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

class LobbyView extends React.Component{
    render(){
        return (
            <form id="groupForm" action="" class="center">
                <input id="userName" autoComplete="off" placeholder="name"/>
                <input id="groupString" autoComplete="off" placeholder="group"/><button>JOIN</button>
            </form>
        )
    }
}

//INIT
var board = new Board();
ReactDOM.render(
    <ContainerView board={board} />,
    document.getElementById('main')
);
ReactDOM.render(
    <ChatBox></ChatBox>,
    document.getElementById('chat')
);
ReactDOM.render(
    <LobbyView></LobbyView>,
    document.getElementById('lobby')
);