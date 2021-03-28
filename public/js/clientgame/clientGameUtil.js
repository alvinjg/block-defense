
// get the point in line using Linear Equation. Which query to use depends on the line orientation. For vertical use queryY, for horizontal use queryX;
// returns an object representing a point
const findPointOfLine = (x1, y1, x2, y2, queryX, queryY) => {
    let newX = queryX;
    let newY = queryY;

    if (x1 !== x2 && y1 !== y2) {
        let slope = (y2 - y1) / (x2 - x1);
        let yIntercept = y1 + (slope * x1)

        // get the queried point using linear equation
        if (y1 == y2) {
            newX = (queryY - yIntercept) / slope;
            newY = y1;
        } else {
            newY = (slope * queryX) + yIntercept;
        }
    }

    // a Point object
    return {
        "x": Math.floor(newX),
        "y": Math.floor(newY)
    };
};


