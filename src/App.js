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
        <button style={props.style} className={props.className} onClick={props.onClick}>
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
            showNumbers: false,
            solverType: "muur",
            solverPassed: Array(25).fill(0),
            solverSolutionPath: [],
        };
        this.handleChange = this.handleChange.bind(this);
    }

    renderSquare(i) {
        if (i === this.state.start) {
            return (<Square className="start" value={"Start"} style={{backgroundColor:this.state.solverSolutionPath.includes(i) ? "var(--path)" : ""}}/>);
        } else if (i === this.state.end) {
            return (<Square className="end" value={"End"} style={{backgroundColor:this.state.solverSolutionPath.includes(i) ? "var(--path)" :`hsl(195, 53%, ${100 - this.state.solverPassed[i]*20}%)`}}/>);
        } else {
            return (
                <Square
                    style={{backgroundColor:this.state.solverSolutionPath.includes(i) ? "var(--path)" :`hsl(195, 53%, ${100 - this.state.solverPassed[i]*20}%)`}}
                    className={this.state.solverPassed[i] ? "square square-visit":"square"}
                    value={this.state.showNumbers? i : this.state.squares[i]}
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
            solverPassed: Array(Math.pow(parseInt(event.target.value), 2)).fill(0),
            solverSolutionPath: [],
        });
    }

    //solvers
    wallSolver = (size, position, end, maze, timeoutLength) => {
        //console.log("starting the wall solve");
        //console.log(this.state.squares);
        let currentSolution = [position];
        let solved = false;
        let rotate = 0;
        let steps = 0;
        let surroundingSpaces,solution;
        let facing = 2;
        let checkNewValue = (array, value) => {
          if(array.indexOf(value) > -1){
              return array.splice(array.indexOf(value)+1)
          }else{
              return array.push(value);
          }
        };
        let checkEnd = () => {
            if (position === end) {
                solved = true;
                solution = currentSolution;
            }
        };

        let slowSolve = () => {
            if (!solved) {
                surroundingSpaces = checkSpace(size, position, false, maze);
                //console.log(surroundingSpaces);
                console.log(currentSolution);
                //console.log(this.state.squares);

                if (!surroundingSpaces[(facing + 3)%4]) {
                    facing = facing ? facing - 1 : 3;
                    rotate = 0;

                    position = position + moveSpace(facing, size.columns);
                    let SolverPassedWithItem = [...this.state.solverPassed];
                    if (SolverPassedWithItem[position]++ > 3){
                        solved = true;
                        solution = false;
                    }
                    checkNewValue(currentSolution,position);
                    this.setState({solverPassed: SolverPassedWithItem, solverSolutionPath: currentSolution});

                    console.log(`rotated left and moved to ${position}`);
                    steps++;
                    checkEnd();
                    setTimeout(slowSolve, timeoutLength);

                } else if (!surroundingSpaces[facing]) {
                    rotate = 0;

                    position = position + moveSpace(facing, size.columns);
                    let SolverPassedWithItem = [...this.state.solverPassed];
                    if (SolverPassedWithItem[position]++ > 3){
                        solved = true;
                        solution = false;
                    }
                    checkNewValue(currentSolution,position);
                    this.setState({solverPassed: SolverPassedWithItem, solverSolutionPath: currentSolution});
                    console.log(`moved to ${position}`);
                    steps++;
                    checkEnd();
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
            } else {
                if(!solution)this.setState({solverSolutionPath: []});
                console.log(solution); console.log(`in ${steps} steps`)
            }
        };
        slowSolve();
    };

    dijkstraSolver = (size, position, end, maze, timeoutLength) => {
        let start = position;
        let finalNodeParent;
        position = {id: position, parent: position};
        let visited = [position];
        let toDiscover = [];
        let steps = 0;
        let solved = false;
        let surroundingSpaces,solution;

        let slowSolve = () => {
            if(!solved) {
                surroundingSpaces = checkSpace(size, position.id, false, maze);
                surroundingSpaces.forEach((value, index) => {
                    let space = position.id + moveSpace(index, size.columns);

                    if (value===false && !visited.some(value => value.id === space) && !toDiscover.some(value => value.id === space) && size.columns*size.rows > space && space > -1) {
                        toDiscover = [...toDiscover, {id:space, parent:position.id}];
                    }
                });

                /*
                console.log("surroundingSpaces: ");
                console.log(surroundingSpaces);
                console.log("position: ");
                console.log(position);
                console.log("toDiscover: ");
                console.log(toDiscover);
                console.log("visited: ");
                console.log(visited);
                */

                if (toDiscover.length === 0) {
                    solved = true;
                    solution = false;
                } else {
                    if(toDiscover[0].id === end){
                        solved = true;
                        finalNodeParent = toDiscover[0].parent;
                    }
                    position = toDiscover.shift();
                    visited = [...visited,position];
                    let visitedForState = Array(size.rows*size.columns).fill(0);
                    visited.forEach((item) => visitedForState[item.id]=true);
                    this.setState({solverPassed: visitedForState});
                }

                if (position === end) {
                    solved = true;
                }
                steps++;
                setTimeout(slowSolve, timeoutLength);
            } else {
                if(solution !== false) {
                    let searchingPosition = {id: position, parent: finalNodeParent};
                    let solutionArray = [position.id];
                    const findParent = value => value.id === searchingPosition;

                    while (searchingPosition.id !== start) {
                        searchingPosition = searchingPosition.parent;
                        solutionArray = [searchingPosition, ...solutionArray];
                        // eslint-disable-next-line no-loop-func
                        searchingPosition = visited.find(findParent);
                    }

                    solution = [...solutionArray];
                    this.setState({solverSolutionPath: solution});
                }

                console.log("solution: ");
                console.log(solution);
                console.log(`In ${steps} steps`);
            }
        };
        slowSolve();
    };
    //solvers end

    solve = async () => {
        this.setState({
            solverPassed: Array(Math.pow(parseInt(this.state.rows), 2)).fill(0),
            solverSolutionPath: [],
        }, ()=> {
            switch(this.state.solverType){
                case "dijkstra": this.dijkstraSolver({rows: this.state.rows, columns: this.state.rows}, this.state.start, this.state.end, this.state.squares, 500); break;
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
                    <div>
                        <label htmlFor="size">Grootte:</label>
                        <input className="number" id="size" type="number" value={this.state.rows} min="3" max="50" onChange={this.handleChange}/>
                        <ChangeButton status={this.state.changeStart} type="button" onClick={this.changeStart}>{"Change start"}</ChangeButton>
                        <ChangeButton status={this.state.changeEnd} type="button" onClick={this.changeEnd}>{"Change end"}</ChangeButton>
                        <button className="button" type="button" onClick={this.solve}>{"Solve"}</button>
                        <button className="button" type="button" onMouseDown={() => this.setState({showNumbers: true})} onMouseUp={() => this.setState({showNumbers: false})}>{"Show numbers"}</button>
                    </div>
                    <div>
                        <label htmlFor="algoritme">Kies een algoritme: </label>
                        <select name="algoritme" id="algoritme" onChange={event => this.setState({solverType: event.target.value})}>
                            <option value="muur">Muurvolger</option>
                            <option value="dijkstra">Dijkstra (Breath-first)</option>
                            {/*<option value="breath">Breath-first</option> //wordt waarschijnlijk random-deapth first*/}
                        </select>
                    </div>
                </form>
                <div>
                    {this.renderBoard(this.state.rows)}
                </div>
            </div>
        );
    }

}
export default App;
