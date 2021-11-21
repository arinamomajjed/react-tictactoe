import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    /* funciton components are simpler way to write components
       that only contain a render method and do not have
       their own state
    */
    return (
        <button className={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}
  
class Board extends React.Component {

    renderSquare(i) {
        /* to collect data from multiple children or to
           have two child components interact with each other,
           need to declare the shared state in their parent component instead.
           passing props is how information flows in react apps from
           parents to children, keeping child components in sync with each other
           and with their parent component

        */
        let highlightClass = 'square';
        if (this.props.winners && this.props.winners.indexOf(i) >= 0) {
            console.log(this.props.winner);
            console.log(i);
            highlightClass = 'square highlighted'
        }
        return (
            <Square
                value={this.props.squares[i]}
                /* since the state is considered to be
                   private to a component that defines it,
                   we cannot update the Board's state directly
                   from the square and need to pass down a function
                   and have Square call that function when clicked
                */
                onClick={() => this.props.onClick(i)}
                className={highlightClass}
                // now we are passing down two props to square: value and onClick
                // onClick prop is a function that Square can call when clicked
            />
        );
    }
    
    render() {
        let allSquares = [];
        for (let i = 0; i < 3; i++) {
            let currentRow = []
            for (let j = 0; j < 3; j++) {
                currentRow.push(this.renderSquare(i * 3 + j));
            }
            allSquares.push(<div className="board-row">{currentRow}</div>)
        }
        return (
            <div>
                {allSquares}
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [x, y, z] = lines[i];
        if (squares[x] && squares[x] === squares[y] && squares[y] === squares[z]) {
            return [squares[x], lines[i]];
        }
    }
    return null;
}
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                location: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            movesReversed: false,
        };
    }
    handleClick(i) {
        // copy the squares array
        /* why copy instead of mutate?
           - avoiding direct data mutation lets keep previous versions
           of the game's history intact, and reuse them later.
           - detecting changes becomes easier.
                this helps determine when a component requires re-rendering
        */
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice()
        if (!squares[i] && !calculateWinner(squares)) {
            squares[i] = this.state.xIsNext ? 'X' : 'O';
            this.setState(
                {
                    // unlike push(), conncat() does not mutate the original array
                    history: history.concat([{
                        squares: squares,
                        location: (i % 3, Math.floor(i / 2)),
                    }]),
                    stepNumber: history.length,
                    xIsNext: !this.state.xIsNext,
                }
            );
        }
    }
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }
    toggleMoves() {
        this.setState({
            movesReversed: !this.state.movesReversed,
        });
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const stepNumber = this.state.stepNumber;
        const isDraw = (history.length === 10 && !winner) ? true : false;
        /* step refers to the current history element value
           move refers to the index.
           note: in order to use the map method on the array,
                 the first argument step is required and the
                 second one is optional. for our use, we only
                 need the index (move)
        */
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            /* assign proper keys when building dynamic lists.
                keys tell React about the identity of each component
                which allows React to maintain states between re-renders.
                React automatically uses key to decide which components
                to update. a component cannot inquire about its key (cannot
                call this.props.key)
                array indecies which React uses as default is not recommended
                in most cases.
                keys do not need to be globally unique - only between components
                and their siblings.
                here, we choose move (index) to be the key because they are never
                re-ordered, deleted, or inserted in the middle so they are safe.
            */
            let moveStr = (move === stepNumber && history.length - 1 !== stepNumber) ? (<b>{desc}</b>) : desc;
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {moveStr}
                    </button>
                </li>
            );
        })
        if (this.state.movesReversed) {
            moves.reverse();
        }
        let status;
        let winnerLine;
        if (winner) {
            status = 'Winner: ' + winner[0];
            winnerLine = winner[1];
        } else if (isDraw) {
            status = 'Draw'
        } else{
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                <Board squares={current.squares} onClick={(i) => this.handleClick(i)} winners={winnerLine}/>
                </div>
                <div className="game-info">
                <div>{status}</div>
                <button onClick={() => this.toggleMoves()}>reverse</button>
                <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================
  
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
  