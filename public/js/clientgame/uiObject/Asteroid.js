
let asteroidSprite = null;
window.onload = function () {
    // The sprite should be added in the html using the <img> tag
    asteroidSprite = document.getElementById("asteroidSprite");
}

class Asteroid extends LivingObject {
    constructor(canvas, property) {
        super(canvas, property);
        this._property = property;

        if (!property) {
            this._property._x = Math.floor(canvas.width / 2) - Math.floor(this._property._width / 2);
            this._property._y = 20;
        }

        this._property._target_x = this._property._x;
        this._property._target_y = this._property._y;

        this._startRadius = this._property._radius;
        this._lastHitTime = new Date();

        this._refreshRateCtr = 0;
        this._canvasRefreshRate = 15; // canvas refresh every 15ms;
        this._asteroidRefreshRate = 60; // Asteroid sprite should refresh at 60ms
        // use for sprite animation
        this._currentFrame = 0;
        this._numOfSpriteRow = 8;
        this._numOfSpriteCol = 8;
        this._frameWidth = 128;
        this._frameHeight = 128;

        // the sprite has 2 animation, left and right rotation animation
        // this randomly set which animation should this asteroid be animated
        this._LeftRotationAnimation = Math.random() > 0.5;
        if (!this._LeftRotationAnimation) {
            this._currentFrame = this._numOfSpriteCol * 4; // frame after the 4 row is the start of right rotation asteroid
        }

        // mini Asteroids to display once the mother asteroid is destroyed
        this._miniAsteroid = new Map(); // key value pair <Asteroid, AsteroidController>
    }

    createMiniAsteroids() {
        let thisObj = this;
        const createSingleAsteroid = (targetX, targetY, speedX, speedY) => {
            let astProp = new AsteroidProperty();
            astProp._radius = this._property._radius / ((Math.random() * 2) + 1);
            astProp._x = this._property._x;
            astProp._y = this._property._y;
            astProp._movementType = MOVEMENT_TYPE.IDLE;

            let ast = new Asteroid(this._canvas, astProp);
            let cont = new AsteroidController(ast, null);
            astProp._target_x = targetX;
            astProp._target_y = targetY;
            astProp._speed_x = speedX;
            astProp._speed_y = speedY;
            thisObj._miniAsteroid.set(ast, cont);
        }

        const randSpeed = () => {
            return Math.random() * 3;
        };

        const randPoint = () => {
            return (Math.random() * 150) + 400;
        };

        let rand = (Math.random() * 2) + 1;
        for (let i = 0; i < rand; i++) {
            createSingleAsteroid(this._property._x - randPoint(), this._property._y - randPoint(), randSpeed(), randSpeed());
            createSingleAsteroid(this._property._x + randPoint(), this._property._y - randPoint(), randSpeed(), randSpeed());
            createSingleAsteroid(this._property._x + randPoint(), this._property._y + randPoint(), randSpeed(), randSpeed());
            createSingleAsteroid(this._property._x - randPoint(), this._property._y + randPoint(), randSpeed(), randSpeed());
        }
    }


    changeFrame() {
        this._refreshRateCtr += this._canvasRefreshRate;

        if (this._refreshRateCtr > this._asteroidRefreshRate) {
            // Pick next frame
            this._currentFrame++;
            this._refreshRateCtr = 0;
        }

        // Make the frames loop
        if (this._LeftRotationAnimation) {
            let maxFrame = (this._numOfSpriteCol * 4) - 1; // left rotation ends at the row 4 of the sprite
            if (this._currentFrame > maxFrame) {
                this._currentFrame = 0;
            }
        } else {
            let maxFrame = (this._numOfSpriteCol * 8) - 1; // right rotation ends in 8 row of the sprite
            if (this._currentFrame > maxFrame) {
                this._currentFrame = this._numOfSpriteCol * 4; // frame after the 4 row is the start of right rotation animation
            }
        }
    }

    draw() {
        // this.hitEffect();
        if (OBJECT_STATUS.EXIST === this._property._status) {
            this.changeFrame();

            this._context.imageSmoothingEnabled = true;
            this._context.imageSmoothingQuality = 'high';
            // Update rows and columns
            let column = this._currentFrame % this._numOfSpriteCol;
            let row = Math.floor(this._currentFrame / this._numOfSpriteCol);
            // draw the frame in the sprite
            this._context.drawImage(asteroidSprite, column * this._frameWidth, row * this._frameHeight, this._frameWidth, this._frameHeight, this._property._x, this._property._y, this._property._radius, this._property._radius);
        } else if (OBJECT_STATUS.DESTROYED === this._property._status) {
            if (this._miniAsteroid.size === 0) {
                this.createMiniAsteroids();
            }

            for (let [asteroid, controller] of this._miniAsteroid) {
                controller.control();
                asteroid.draw();
            }
        }
    }

    hit(damage = 0) {
        this._lastHitTime = new Date();
        this._property._currentLife -= damage;

        let scaling = this._property._currentLife / this._property._fullLife;
        if (scaling > 0.5) {
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
        let y = this._property.moveDown();
        this._property._y = y;
    }
}