class LivingObject extends CanvasObject {
    constructor(canvas, property) {
        super(canvas);
        this._property = property;
    }


    moveLeft() {
        let x = this._property.moveLeft();
        this._property._x = x;
    }

    moveRight() {
        let x = this._property.moveRight();
        this._property._x = x;
    }

    moveUp() {
        let y = this._property.moveUp();
        this._property._y = y;
    }

    moveDown() {
        let y = this._property.moveDown();
        this._property._y = y;
    }
}