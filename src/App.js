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

let ChangeButton = props => {
    let status = props.status;
    let ClassName = "button";
    if (status===true) ClassName = "button buttonPressed";
    return(
        <button className={ClassName} type={props.type} onClick={props.onClick}>{props.children}</button>
    )
};


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            squares: Array(25).fill(null),
            start: 0,
            end: 24,
            changeStart: false,
            changeEnd: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    renderSquare(i) {
        if (i === this.state.start) {
            return (<Square className="start" value={"Start"}/>);
        } else if (i === this.state.end) {
            return (<Square className="end" value={"End"}/>);
        } else {
            return (
                <Square
                    className="square"
                    value={this.state.squares[i]}
                    onClick={() => this.handleClick(i)}
                />
            );
        }
    }

    handleClick(i){
        if(this.state.changeStart){
            this.setState({start: i});
        }else if(this.state.changeEnd){
            this.setState({end: i});
        }else {
            const squares = this.state.squares.slice();
            squares[i] = (squares[i] == null) ? 'X' : null;
            this.setState({
                squares: squares
            })
        }
    }

    handleChange(event) {
        this.setState({
            rows: event.target.value,
            squares: Array(Math.pow(event.target.value, 2)).fill(null),
            start: 0,
            end: Math.pow(event.target.value, 2) - 1
        });
    }

    changeStart = () => {
        this.setState({
            changeStart: !this.state.changeStart,
            changeEnd: false
        });
    };

    changeEnd = () =>{
        this.setState({
            changeStart: false,
            changeEnd: !this.state.changeEnd
        });
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
                    <input className="number" type="number" value={this.state.rows} min="3" onChange={this.handleChange} />
                    <ChangeButton status={this.state.changeStart} type="button" onClick={this.changeStart}>{"Change start"}</ChangeButton>
                    <ChangeButton status={this.state.changeEnd} type="button" onClick={this.changeEnd}>{"Change end"}</ChangeButton>
                    {/*<button className="button" type="button" onClick={this.solve}>{"Solve"}</button>*/}
                </form>
                {this.renderBoard(this.state.rows)}
            </div>
        );
    }

}
export default App;
