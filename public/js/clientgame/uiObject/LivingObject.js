class LivingObject extends CanvasObject {
    constructor(canvas, property) {
        super(canvas);
        this._property = property;
    }

    
    moveLeft() {
        let x = this._property._x - this._property._speed_x;
        if (x > this._property._totalRadius) {
            this._property._x = x;
        }
    }

    moveRight() {
        let x = this._property._x + this._property._speed_x;
        if (x < this._canvas.width - this._property._totalRadius) {
            this._property._x = x;
        }
    }

    moveUp() {
        let y = this._property._y - this._property._speed_y;

        if (y > this._property._radius + this._property._totalRadius) {
            this._property._y = y;
        }
    }

    moveDown() {
        let y = this._property._y + this._property._speed_y;
        if (y < this._canvas.height - this._property._totalRadius) {
            this._property._y = y;
        }
    }
}