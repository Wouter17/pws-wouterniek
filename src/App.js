import React from 'react';
// eslint-disable-next-line
import logo from './logo.svg';
import './App.css';

function App() {
  return (
      <div className="game">
          <div className="game-board">
              <Board />
          </div>
          <div className="game-info">
              <div>{/* status */}</div>
              <ol>{/* TODO */}</ol>
          </div>
      </div>
  );
}

let Square = (props) => {
    return (
        <button className={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    );
};


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: '5',
            squares: Array(25).fill(null),
            start: '0',
            end: '24',
            changeStart: false,
            changeEnd: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    renderSquare(i) {
        if(!(i === 0 || i === Math.pow(this.state.rows,2)-1)) {
            return (
                <Square
                    className="square"
                    value={this.state.squares[i]}
                    onClick={() => this.handleClick(i)}
                />
            );
        }else{
            if(i===0) {
                return (<Square className="start" value={"Start"}/>);
            }else{
                return (<Square className="end" value={"End"}/>);
            }
        }
    }

    handleClick(i){
        if(this.state.changeStart){
            {/*TODO toevoegen verandering start*/}
        }else if(this.state.changeEnd){
            {/*TODO toevoegen verandering eind*/}
        }else {
            const squares = this.state.squares.slice();
            squares[i] = (squares[i] == null) ? 'X' : null;
            this.setState({
                squares: squares
            })
        }
    }

    handleChange(event) {
        this.setState({rows: event.target.value});
        this.setState({squares: Array(Math.pow(event.target.value, 2)).fill(null)});
    }

    changeStart = event => {
        this.setState({
            changeStart: !this.state.changeStart,
            changeEnd: false
        });
    };

    changeEnd = event =>{
        this.setState({
            changeStart: false,
            changeEnd: !this.state.changeEnd
        });
        console.log("changeing buttonPressed");
        event.currentTarget.classList.toggle("buttonPressed")
    };

    renderBoard = (rows) => {
        let board = [];

        for(let i = 0; i<rows; i++){
            let children = [];
            for(let z = 0; z < rows; z++){
                children.push(this.renderSquare(i*rows+z));
            }
            board.push(<div className="board-row">{children}</div>);
        }
        return board;
    };

    render() {return (
            <div>
                <form>
                    <input className="number" type="number" value={this.state.rows} onChange={this.handleChange} />
                    {<button className="button" type="button" onClick={this.changeStart}>{"Change start"}</button>}
                    <button className="button" type="button" onClick={this.changeEnd}>{"Change end"}</button>
                    {/*<button className="button" type="button" onClick={this.solve}>{"Solve"}</button>*/}
                </form>
                {this.renderBoard(this.state.rows)}
            </div>
        );
    }

}
export default App;
