import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    /* funciton components are simpler way to write components
       that only contain a render method and do not have
       their own state
    */
    return (
        <button className="square" onClick={props.onClick}>
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
                // now we are passing down two props to square: value and onClick
                // onClick prop is a function that Square can call when clicked
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
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
            return squares[x]
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
            }],
            stepNumber: 0,
            xIsNext: true,
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
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
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
            return (
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
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            )
        })
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                <Board squares={current.squares} onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                <div>{status}</div>
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
  