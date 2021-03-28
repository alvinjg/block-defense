class Spacecraft extends LivingObject {
    constructor(canvas, property) {
        super(canvas, property);
        this._property = property;

        this._property._x = Math.round(canvas.width / 2);
        this._property._y = Math.floor(canvas.height / 1.2);
        this._property._target_x = this._property._x;
        this._property._target_y = this._property._y;

        this._moveUpBoundary = Math.floor(canvas.height / 3);

        this._strokeWidth = 10;
        this._property._totalRadius = this._property._radius + Math.floor(this._strokeWidth/2);

        if (!this._property._color) {
            let randomColor = Math.floor(Math.random() * 16777215).toString(16);
            let color = "#" + randomColor + "7f";
            console.log(color);
            this._property._color = color;
        }
    }

    draw() {
        this._context.beginPath();
        this._context.arc(this._property._x, this._property._y, this._property._radius, 0, Math.PI * 2);
        this._context.strokeStyle = this._property._color;
        this._context.lineWidth = this._strokeWidth;
        this._context.stroke();
        this._context.fillStyle = this._property._color;
        this._context.fill();
        // this._context.font = "30px Arial";
        // this._context.fillText("name", this._x, this._y);
        this._context.closePath();
    }

    update() {
        this._property._firedAmmos.forEach(bullet => {
            bullet.move();
        });
    }

    firePrimaryAmmo() {
        let ammo1 = new PrimaryAmmoProperty();
        ammo1._x = this._property._x - Math.floor(ammo1._width/2);
        ammo1._y = this._property._y - this._property._radius;
        ammo1._color = this._property._color;

        this._property._firedAmmos.push(ammo1);
    }

    // overriden
    moveUp() {
        let y = this._property.moveUp();

        if (y > this._property._radius + this._moveUpBoundary) {
            this._property._y = y;
        }
    }
}