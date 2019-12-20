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
            fontSize: "2vw",
            padding: 5,
            height: "7vw",
            width: "16vw",
            color: this.state.selected ? this.props.color : null
        };

        return (
            <button onClick={this.handleClick} className={"wordsquare"} disabled={this.state.selected ? true : false}
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
            width: "80vw",
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

class TeamRoleSelect extends React.Component{
    render(){
        return (
            <div>
                <button id="redmaster">RED MASTER</button>
                <button id="redguesser">RED GUESSER</button>
                <button id="bluemaster">BLUE MASTER</button>
                <button id="blueguesser">BLUE GUESSER</button>
            </div>
        )
    }
}

class ChatBox extends React.Component{
    render(){
        return(
            <div>
                <ul id="messages"></ul>
                <form id="chatForm" action="">
                    <input id="m" autoComplete="off" />
                </form>
            </div>
        )
    }
}

class PlayersView extends React.Component{
    constructor(props) {
        super(props);
        this.state = { players: props.players };
        window.updatePlayers = this.onPlayersUpdate.bind(this);
    }

    onPlayersUpdate(){
        this.setState({ players: this.props.players });
    }

    render(){
        let playersRed = [];
        let playersBlue = [];
        this.state.players.forEach(p => {
            let arr = p.team == "red" ? playersRed : playersBlue;
            arr.push(<li key={p.username}>{`${p.username}: ${p.role}`}</li>)
        });

        return(
            <div>
                <ul id="playersRed" style={{color: "red"}}>{playersRed}</ul>
                <ul id="playersBlue" style={{ color: "blue" }}>{playersBlue}</ul>
            </div>
        );
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
                <div id="turn"/>
                <TeamRoleSelect></TeamRoleSelect>
                <BoardView board={this.state.board}
                    onPlay={this.onBoardUpdate.bind(this)} />
                <form id="masterForm" action="">
                    <input id="hint" type="text" placeholder="hint"></input>
                    <input id="numSquares" type="number" min="1" max="5" placeholder="n"></input>
                    <button>send</button>
                </form>
                <div id="masterBoardContainer"></div>
            </div>
        )
    }
}

class LobbyView extends React.Component{
    render(){
        return (
            <form id="groupForm" action="" className="center">
                <input id="userName" autoComplete="off" placeholder="name" defaultValue="user" />
                <input id="groupString" autoComplete="off" placeholder="group" defaultValue="group" />
                <button>JOIN</button>
            </form>
        )
    }
}

//INIT
var playersList = [];
var board = new Board();
ReactDOM.render(
    <ContainerView board={board} />,
    document.getElementById('main')
);
ReactDOM.render(
    <PlayersView players={playersList}></PlayersView>,
    document.getElementById('players')
);
ReactDOM.render(
    <ChatBox></ChatBox>,
    document.getElementById('chat')
);
ReactDOM.render(
    <LobbyView></LobbyView>,
    document.getElementById('lobby')
);
