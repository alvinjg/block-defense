class AsteroidController {

    constructor(asteroid) {
        this._asteroid = asteroid;
        this._asteroid._controller = this;

        this._isMovingUp = false;
        this._isMovingLeft = false;
        this._isMovingRight = false;
        this._isMovingDown = true;

        this._moveXCooldown = 100;
        this._lastMoveX = new Date();
    }

    control() {
        if (this._asteroid !== undefined || this._asteroid !== null) {
            if (this._isMovingUp) {
                this._asteroid.moveUp();
            }
            if (this._isMovingLeft) {
                this._asteroid.moveLeft();
            }
            if (this._isMovingDown) {
                this._asteroid.moveDown()
            }
            if (this._isMovingRight) {
                this._asteroid.moveRight();
            }
        }
    }

    randomControl() {
        let current = new Date();
        let elapsed = current - this._lastMoveX;

        if (elapsed > this._moveXCooldown) {
            let x = Math.round(Math.random()) === 1;

            if (x) {
                x = Math.round(Math.random()) === 1;
                this._isMovingLeft = x;
                this._isMovingRight = !x;
            } else {
                this._isMovingLeft = false;
                this._isMovingRight = false;
            }

            this._lastMoveX = current;
            this._moveXCooldown = 500 + Math.floor(Math.random() * 1000);
        }
    }
}