class AsteroidController {

    constructor(asteroid, clientSocket) {
        this._asteroid = asteroid;
        this._clientSocket = clientSocket;
        this._asteroid._controller = this;

        this._moveXCooldown = 100;
        this._lastMoveX = new Date();

        this._clientSocket.on(sockConst.MOVE_ASTEROID, (movementObj)=>{
            movementObj = JSON.parse(movementObj);

            this._asteroid._property._target_x = movementObj.x;
            this._asteroid._property._target_y = movementObj.y;
        });
    }

    // actual movement of spaceship in canvas
    moveAsteroid() {
        let xDirection = this._asteroid._property._target_x - this._asteroid._property._x;
        let yDirection = this._asteroid._property._target_y - this._asteroid._property._y;


        if (Math.abs(xDirection) < this._asteroid._property._speed_x) {
            this._asteroid._property._x += xDirection;
        } else if (xDirection < 0) {
            this._asteroid.moveLeft();
        } else if (xDirection > 0) {
            this._asteroid.moveRight();
        }

        if (Math.abs(yDirection) < this._asteroid._property._speed_y) {
            this._asteroid._property._y += yDirection;
        } else if (yDirection < 0) {
            this._asteroid.moveUp();
        } else if (yDirection > 0) {
            this._asteroid.moveDown();
        }
    }

    control() {
        if (this._asteroid !== undefined || this._asteroid !== null) {
            this.moveAsteroid();
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