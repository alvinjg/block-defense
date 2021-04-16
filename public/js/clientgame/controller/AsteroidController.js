class AsteroidController {

    constructor(asteroid, clientSocket) {
        this._asteroid = asteroid;
        this._clientSocket = clientSocket;
        this._asteroid._controller = this;

        this._moveXCooldown = 100;
        this._lastMoveX = new Date();

        if (this.clientSocket) {
            this._clientSocket.on(sockConst.MOVE_ASTEROID, (movementObj) => {
                movementObj = JSON.parse(movementObj);

                this._asteroid._property._target_x = movementObj.x;
                this._asteroid._property._target_y = movementObj.y;
            });
        }



        if (MOVEMENT_TYPE.ZIGZAG === this._asteroid._property._movementType) {
            let rand = Math.random() > 0.5;
            if (rand) {
                this._asteroid._property._target_x = this._asteroid._canvas.width;
                this._ZIGZAG_TO_RIGHT = true;
            } else {
                this._asteroid._property._target_x = 0;
                this._ZIGZAG_TO_RIGHT = false;
            }

            this._asteroid._property._target_y = this._asteroid._canvas.height + 20;
        }
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

        if (MOVEMENT_TYPE.DOWN === this._asteroid._property._movementType) {
            this._asteroid._property._target_y = this._asteroid._canvas.height + 20;
        }
        if (MOVEMENT_TYPE.ZIGZAG === this._asteroid._property._movementType) {
            let x = this._asteroid._property._x;
            let borderMax = this._asteroid._canvas.width - this._asteroid._property._radius - 10;
            let borderMin = this._asteroid._property._radius + 10;
            if (this._ZIGZAG_TO_RIGHT) {
                if (x > borderMax) {
                    this._ZIGZAG_TO_RIGHT = false;
                    this._asteroid._property._target_x = 0;
                }
            } else {
                if (x < borderMin) {
                    this._ZIGZAG_TO_RIGHT = true;
                    this._asteroid._property._target_x = this._asteroid._canvas.width;
                }
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