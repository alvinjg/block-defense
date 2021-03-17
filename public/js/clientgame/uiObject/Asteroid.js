class Asteroid extends LivingObject {
    constructor(canvas, property) {
        super(canvas, property);
        this._property = property;
        this._property._x = Math.floor(canvas.width / 2) - Math.floor(this._property._width / 2);
        this._property._y = 20;

        this._startRadius = this._property._radius;

        this._lastHitTime = new Date();
    }

    draw() {
        this.hitEffect();

        let width = this._property._radius;
        let height = this._property._radius;

        this._context.fillRect(this._property._x, this._property._y, width, height);
        this._context.beginPath();
        this._context.lineWidth = this._strokeWidth;
        this._context.stroke();
        this._context.fillStyle = this._property._color;
        this._context.fill();
        // this._context.font = "30px Arial";
        // this._context.fillText("name", this._property._x, this._property._y);
        this._context.closePath();
    }

    hit(damage = 0) {
        this._lastHitTime = new Date();
        this._property._currentLife -= damage;

        let scaling = this._property._currentLife / this._property._fullLife;
        if (scaling > 0.50) {
            this._property._radius = this._startRadius * scaling;
        }
    }

    hitEffect() {
        let current = new Date();
        let elapsed = current - this._lastHitTime;

        if (this._property._currentLife <= 0) {
            this._context.fillStyle = 'red';
        } else if (elapsed < 50) {
            this._context.fillStyle = '#244885';
        } else {
            this._context.fillStyle = '#001840';
        }
    }


    // checks if this object collides from other object
    isCollided(objX, objY, objRadius) {
        let halfradious = Math.floor(this._property._radius / 2)
        let x = this._property._x + halfradious;
        let y = this._property._y;// + halfradious;

        let distance = this.getDistance(objX, objY, x, y);
        if (distance < (objRadius + halfradious)) {
            return true;
        }
        return false;
    }

    // overridden from LivinObject moveDown()
    moveDown() {
        let y = this._property._y + this._property._speed_y;
        this._property._y = y;
    }
}