import React from 'react';
import {checkSpace, moveSpace} from "./helperfunctions";
//voorbeeld: gebruik checkSpace checkSpace({rows: 5, columns:5}, 4, undefined, this.state.squares)

function App() {
  return (
      <div className="game">
          <div className="game-board">
              <Board />
          </div>
      </div>
  );
}

let Square = props => {
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
            solverState: 'waiting'
        };
        this.handleChange = this.handleChange.bind(this);
    }

    renderSquare(i) {
        if (i === this.state.start) {
            return (<Square className="start" value={"Start"} style={{backgroundColor:this.state.solverSolutionPath.includes(i) ? "var(--path)" : ""}}/>);
        } else if (i === this.state.end) {
            return (<Square className="end" value={"Eind"} style={{backgroundColor:this.state.solverSolutionPath.includes(i) ? "var(--path)" :`hsl(195, 53%, ${100 - this.state.solverPassed[i]*20}%)`}}/>);
        } else {
            return (
                <Square
                    style={{
                        backgroundColor: this.state.solverSolutionPath.includes(i) ? "var(--path)" :`hsl(195, 53%, ${100 - this.state.solverPassed[i]*20}%)`,
                        fontSize: this.state.showNumbers ? `${24- 3*i.toString().length}px` : "24px"
                    }}
                    className='square'
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
            squareChanged[i] = (squareChanged[i] == null) ? 'X' : null;
            this.setState({
                squares: squareChanged
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
            } else { //if the solution has been found
                if(!solution)this.setState({solverSolutionPath: [], solverState: {result: false, steps: steps}}); else this.setState({solverState: {result: true, steps: steps}});
                console.log(solution); console.log(`in ${steps} steps`)
            }
        };
        slowSolve();
    };

    dijkstraSolver = (size, position, end, maze, timeoutLength) => {
        let start = position;
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

                if (toDiscover.length === 0) {
                    solved = true;
                    solution = false;
                } else {
                    position = toDiscover.shift();
                    visited = [...visited,position];
                    let visitedForState = Array(size.rows*size.columns).fill(0);
                    visited.forEach((item) => visitedForState[item.id]=true);
                    this.setState({solverPassed: visitedForState});
                }

                if (position.id === end) {
                    solved = true;
                }
                steps++;
                setTimeout(slowSolve, timeoutLength);

            } else { //if the solution has been found
                if(solution !== false) {
                    let searchingPosition = position;
                    let solutionArray = [position.id];
                    const findParent = value => value.id === searchingPosition;

                    while (searchingPosition.id !== start) {
                        searchingPosition = searchingPosition.parent;
                        solutionArray = [searchingPosition, ...solutionArray];
                        searchingPosition = visited.find(findParent);
                    }

                    solution = [...solutionArray];
                    this.setState({solverSolutionPath: solution, solverState: {result: true, steps: steps}});
                }else{
                    this.setState({solverState: {result: false, steps: steps}})
                }

                console.log("solution: ");
                console.log(solution);
                console.log(`In ${steps} steps`);
            }
        };
        slowSolve();
    };

    aStar = (size, position, end, maze, timeoutLength) => {
        let start = position;
        position = {id: position, parent: position, distanceFromStart:0};
        let visited = [position];
        let toDiscover = [];
        let steps = 0;
        let solved = false;
        let surroundingSpaces,solution;
        let getDistance = pos => {
            return Math.floor(Math.abs((pos-end)/size.rows)) + Math.abs(pos%size.columns-end%size.columns);
        };

        let slowSolve = () => {
            if(!solved){
                surroundingSpaces = checkSpace(size, position.id, false, maze);
                surroundingSpaces.forEach((value, index) => {
                    let space = position.id + moveSpace(index, size.columns);

                    if (value===false && !visited.some(value => value.id === space) && !toDiscover.some(value => value.id === space) && size.columns*size.rows > space && space > -1) {
                        toDiscover = [...toDiscover, {id:space, parent:position.id, distanceFromStart:position.distanceFromStart+1, distance:getDistance(space)+position.distanceFromStart+1}];
                    }
                });

                if (toDiscover.length === 0) {
                    solved = true;
                    solution = false;
                } else {
                    toDiscover.sort((a,b) => a.distance-b.distance);
                    position = toDiscover.shift();
                    visited = [...visited,position];
                    let visitedForState = Array(size.rows*size.columns).fill(0);
                    visited.forEach((item) => visitedForState[item.id]=true);
                    this.setState({solverPassed: visitedForState});
                }

                if (position.id === end) {
                    solved = true;
                }
                steps++;
                setTimeout(slowSolve, timeoutLength);

            }else{
                if(solution !== false) {
                    let searchingPosition = position;
                    let solutionArray = [position.id];
                    const findParent = value => value.id === searchingPosition;

                    while (searchingPosition.id !== start) {
                        searchingPosition = searchingPosition.parent;
                        solutionArray = [searchingPosition, ...solutionArray];
                        searchingPosition = visited.find(findParent);
                    }

                    solution = [...solutionArray];
                    this.setState({solverSolutionPath: solution, solverState: {result: true, steps: steps}});
                }else{
                    this.setState({solverState: {result: false, steps: steps}});
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
        if(this.state.solverState === "solving") return;
        this.setState({
            solverPassed: Array(Math.pow(parseInt(this.state.rows), 2)).fill(0),
            solverSolutionPath: [],
            solverState:"solving"
        }, ()=> {
            switch(this.state.solverType){
                case "dijkstra": this.dijkstraSolver({rows: this.state.rows, columns: this.state.rows}, this.state.start, this.state.end, this.state.squares, 500); break;
                case "A*": this.aStar({rows: this.state.rows, columns: this.state.rows}, this.state.start, this.state.end, this.state.squares, 500); break;
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

    getStatus = () => {
        let state = this.state.solverState;
        let solve = this.state.solverSolutionPath;

        if (state === "waiting") {
            return "Druk op oplossen zodra je klaar bent met tekenen";
        }if (state === "solving") {
            return "Druk bezig met het oplossen van het doolhof";
        }else if(state.result === false){
            return `Mislukt na ${state.steps} stappen`;
        }else if(state.result === true){
            return `Gelukt na ${state.steps} stappen in ${solve.length-1} stappen via ${solve.join('→')}`;
        } else return "Het feit dat je dit ziet betekent dat er iets is misgegaan😅";
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

    render() {
        return (
            <div>
                <form>
                    <div>
                        <label htmlFor="size">Grootte:</label>
                        <input className="number" id="size" type="number" value={this.state.rows} min="3" max="50" onChange={this.handleChange}/>
                        <ChangeButton status={this.state.changeStart} type="button" onClick={this.changeStart}>{"Verander start"}</ChangeButton>
                        <ChangeButton status={this.state.changeEnd} type="button" onClick={this.changeEnd}>{"Verander eind"}</ChangeButton>
                        <button className="button" type="button" onClick={this.solve}>{"Oplossen"}</button>
                        <button className="button" type="button" onMouseDown={() => this.setState({showNumbers: true})} onMouseUp={() => this.setState({showNumbers: false})}>{"Laat nummers zien"}</button>
                    </div>
                    <div className='agoritmeSelector'>
                        <label htmlFor="algoritme">Kies een algoritme: </label>
                        <select name="algoritme" id="algoritme" onChange={event => this.setState({solverType: event.target.value})}>
                            <option value="muur">Muurvolger</option>
                            <option value="dijkstra">Dijkstra (Breath-first)</option>
                            <option value="A*">A*</option>
                        </select>
                    </div>
                </form>
                <div>
                    {this.renderBoard(this.state.rows)}
                </div>
                <span className='status'>Status: </span>
                <b>{this.getStatus()}</b>
            </div>
        );
    }

}
export default App;
