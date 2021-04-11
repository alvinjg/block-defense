let allyShip = null;
window.addEventListener('load', function () {
    allyShip = document.getElementById("allyShip");
});

class Spacecraft extends LivingObject {
    constructor(canvas, property) {
        super(canvas, property);
        this._property = property;
        this._property._totalRadius = this._property._radius * 0.4;

        if (!property) {
            this._property._x = Math.round(canvas.width / 2);
            this._property._y = Math.floor(canvas.height / 1.2);
        }

        this._property._target_x = this._property._x;
        this._property._target_y = this._property._y;

        this._moveUpBoundary = Math.floor(canvas.height * 0.25);
        // dimension of spaceship
        this._width = this._property._radius * 2;
        this._height = this._property._radius * 2;

        if (!this._property._color) {
            let randomColor = Math.floor(Math.random() * 16777215).toString(16);
            let color = "#" + randomColor + "7f";
            console.log(color);
            this._property._color = color;
        }

        // use for finding image in sprite
        this._numOfSpriteRow = 1;
        this._numOfSpriteCol = 5;
        this._frameWidth = 128;
        this._frameHeight = 128;

        // last collision from other object
        this._lastHitTime = new Date();
    }

    draw() {
        if (OBJECT_STATUS.EXIST === this._property._status) {
            if (this._property._immune) {
                let elapsed = new Date() - this._lastHitTime;
                // blink every 150ms when immune
                if ((elapsed % 300) > 150) {
                    return;
                }
            }

            this._context.imageSmoothingEnabled = true;
            this._context.imageSmoothingQuality = 'high';

            // Select the image in row 0, column 4
            let row = 0;
            let column = 4;
            let imgX = this._property._x - this._property._radius;
            let imgY = this._property._y - this._property._radius;
            // draw the frame in the sprite
            this._context.drawImage(allyShip, column * this._frameWidth, row * this._frameHeight, this._frameWidth, this._frameHeight, imgX, imgY, this._width, this._height);

            this._context.fillStyle = this._property._color;
            this._context.font = "10px Arial";
            this._context.fillText(this._property._playerName, imgX, (imgY + this._height) + 10);

        } else if (OBJECT_STATUS.DESTROYED === this._property._status) {

        }
    }

    update() {
        this._property._firedAmmos.forEach(bullet => {
            bullet.move();
        });
    }

    firePrimaryAmmo() {
        let ammo1 = new PrimaryAmmoProperty();
        ammo1._x = this._property._x - Math.floor(ammo1._width / 2);
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

    hit(damage = 0) {
        this._lastHitTime = new Date();
        this._property._currentLife -= damage;
    }

    // checks if this object collides from other object
    isCollided(objX, objY, objRadius) {
        let innerRadius = this._property._radius * 0.8;
        let x = this._property._x;
        let y = this._property._y;

        let distance = this.getDistance(objX, objY, x, y);
        if (distance < (objRadius + innerRadius)) {
            return true;
        }
        return false;
    }
}