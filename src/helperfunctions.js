function checkSpace(size, position, direction, database){
    database = database.map(x =>{return x === "X"});
    let typeSize = typeof size;
    let typeDirection = typeof direction;
    let rows,columns;

    //testen op goede datatypen
    if(typeof position !== "number") {
        throw new Error("expected number for position");
    }
    if(typeof database !== "object") {
        throw new Error("expected object for database");
    }

    //verschil maken tussen datatypen
    if(typeSize === "object"){
        rows = size.rows;
        columns = size.columns;
    }else if (typeSize === "number"){
        rows = columns = size;
    }else{
        throw new Error("expected number for size");
    }

    if(typeDirection === "number"){
        switch (direction) {
            case 1:
                return (position < columns || database[position - columns]);
            case 2:
                return (position%columns === columns-1 || database[position + 1]);
            case 3:
                return (Math.ceil(position/columns) === rows || database[position + columns]);
            case 4:
                return (position%columns === 0 || database[position - 1]);
            default:
                throw new Error("invalid number for direction");
        }
    }else if(typeDirection === "undefined"){
        return (
            [
                (position < columns || database[position - columns]),
                (position%columns === columns-1 || database[position + 1]),
                (Math.ceil(position/columns) === rows || database[position + columns]),
                (position%columns === 0 || database[position - 1])
            ]
        );
    }else{
        throw new Error("expected number or undefined for direction")
    }
}
module.exports = {checkSpace};
