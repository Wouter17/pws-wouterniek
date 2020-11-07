function checkSpace(size, position, direction, database){
    database = database.map(x =>{return x === "X"});
    let typeSize = typeof size;
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

    if(typeof direction === "number"){
        switch (direction) {
            case 1:
                return (position < columns || database[position - columns] || database[position - columns] == null);
            case 2:
                return (position%columns === columns-1 || database[position + 1]);
            case 3:
                return (Math.ceil(position/columns) === rows || database[position + columns] || database[position + columns] == null);
            case 4:
                return (position%columns === 0 || database[position - 1]);
            default:
                throw new Error("invalid number for direction");
        }
    }else if(!direction){
        return (
            [
                (position < columns || database[position - columns] || database[position - columns] == null),
                (position%columns === columns-1 || database[position + 1]),
                (Math.ceil(position/columns) === rows || database[position + columns] || database[position + columns] == null),
                (position%columns === 0 || database[position - 1])
            ]
        );
    }else{
        throw new Error("expected number or falsy value for direction")
    }
}

function moveSpace(facing, columns){
    columns = parseInt(columns);
    let position = 0;
    switch (facing) {
        default:
            position = position - columns;
            break;
        case 1:
            position++;
            break;
        case 2:
            position = position + columns;
            break;
        case 3:
            position--;
            break;
    }
    return position;
}
module.exports = {checkSpace, moveSpace};
