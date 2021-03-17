class CanvasObject {

    constructor(canvas){
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
    }

    
    // get the distance of two points using pythagorean theorem
    getDistance(x1, y1, x2, y2) {
        let xDistance = Math.abs(x2 - x1);
        let yDistance = Math.abs(y2 - y1);

        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

}