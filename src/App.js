import React from 'react';
// eslint-disable-next-line
import logo from './logo.svg';
import './App.css';
import {checkSpace, moveSpace} from "./helperfunctions";
//voorbeeld: gebruik checkSpace checkSpace({rows: 5, columns:5}, 4, undefined, this.state.squares)

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
            changeEnd: false,
            solverType: "wall",
            solverPassed: Array(25).fill(0),
        };
        this.handleChange = this.handleChange.bind(this);
    }

    renderSquare(i) {
        if (i === this.state.start) {
            return (<Square className="start" value={"Start"}/>);
        } else if (i === this.state.end) {
            return (<Square className={this.state.solverPassed[i] ? "end-visit":"end"} value={"End"}/>);
        } else {
            return (
                <Square
                    className={this.state.solverPassed[i] ? "square square-visit":"square"}
                    value={this.state.squares[i]}
                    onClick={() => this.handleClick(i)}
                />
            );
        }
    }

    handleClick(i){
        let squareChanged = [...this.state.squares];
        if(this.state.changeStart){
            squareChanged[i] = null;
            this.setState({start: i, squares: squareChanged});
        }else if(this.state.changeEnd){
            squareChanged[i] = null;
            this.setState({end: i, squares: squareChanged});
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
            rows: parseInt(event.target.value),
            squares: Array(Math.pow(parseInt(event.target.value), 2)).fill(null),
            start: 0,
            end: Math.pow(event.target.value, 2) - 1,
            solverPassed: Array(Math.pow(parseInt(event.target.value), 2)).fill(0)
        });
    }

    //solvers
    wallSolver = (size, position, end, maze, timeoutLength) => {
        //console.log("starting the wall solve");
        //console.log(this.state.squares);
        let solved = false;
        let rotate = 0;
        let steps = 0;
        let surroundingSpaces,solution;
        let facing = 2;
        let slowSolve = () => {
            if (!solved) {
                surroundingSpaces = checkSpace(size, position, false, maze);
                //console.log(surroundingSpaces);
                //console.log(facing);
                //console.log(this.state.squares);

                if (!surroundingSpaces[(facing + 3)%4]) {
                    facing = facing ? facing - 1 : 3;
                    rotate = 0;

                    position = position + moveSpace(facing, size.columns);
                    let SolverPassedWithItem = [...this.state.solverPassed];
                    if (SolverPassedWithItem[position]++ > 4){
                        solved = true;
                        solution = false;
                    }
                    this.setState({solverPassed: SolverPassedWithItem});

                    console.log(`rotated left and moved to ${position}`);
                    setTimeout(slowSolve, timeoutLength);

                } else if (!surroundingSpaces[facing]) {

                    position = position + moveSpace(facing, size.columns);
                    let SolverPassedWithItem = [...this.state.solverPassed];
                    if (SolverPassedWithItem[position]++ > 4){
                        solved = true;
                        solution = false;
                    }
                    this.setState({solverPassed: SolverPassedWithItem});
                    console.log(`moved to ${position}`);
                    setTimeout(slowSolve, timeoutLength);

                } else {
                    facing = (facing >= 3) ? 0 : facing + 1;
                    if (rotate++ >= 4) {
                        solved = true;
                        solution = false
                    }
                    console.log("rotated right");
                    slowSolve();
                }
		        steps++;
                if (position === end) {
                    solved = true;
                    solution = this.state.solverPassed;
                }
            } else {console.log(solution); console.log(`in ${steps} steps`)}
        };
        slowSolve();
    };
    //solvers end

    solve = async () => {
        this.setState({solverPassed: Array(Math.pow(parseInt(this.state.rows), 2)).fill(0)}, ()=> {
            switch(this.state.solverType){
                default: this.wallSolver({rows: this.state.rows, columns: this.state.rows}, this.state.start, this.state.end, this.state.squares, 500);
            }
        })

    };

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
                    {<button className="button" type="button" onClick={this.solve}>{"Solve"}</button>}
                </form>
                {this.renderBoard(this.state.rows)}
            </div>
        );
    }

}
export default App;
