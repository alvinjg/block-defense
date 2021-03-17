class Ammo extends CanvasObject {
    constructor(canvas, property) {
        super(canvas);
        this._property = property;
    }

    draw() {
        this._context.fillStyle = this._property._color;
        this._context.fillRect(this._property._x, this._property._y, this._property._width, this._property._height);
    }

    setProperty(property) {
        this._property = property;
    }
}

class PrimaryAmmo extends Ammo {
    constructor(canvas, property) {
        super(canvas);
        this._property = property;
    }
}