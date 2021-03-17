class SpacecraftController {

    constructor(spaceship, clientSocket) {
        this._spaceship = spaceship;
        this._clientSocket = clientSocket;

        this._isMovingUp = false;
        this._isMovingLeft = false;
        this._isMovingRight = false;
        this._isMovingDown = false;
        this._isFiring = false;

        this._firingCooldown = 100;
        this._lastFired = new Date();
        this._targetX = this._spaceship._property._x;
        this._targetY = this._spaceship._property._y;

        this._clientSocket.on(sockConst.MOVE_PLAYER, (movementObj) => {
            movementObj = JSON.parse(movementObj);
            let sessId = movementObj.sessionId;
            let shipSessId = this._spaceship._property._sessionId;
            if (sessId === shipSessId) {
                this._targetX = movementObj.x;
                this._targetY = movementObj.y;
                this.moveSpaceShip(movementObj);
            }
        });

        this._clientSocket.on(sockConst.PLAYER_SHOOTING, (shotObj) => {
            shotObj = JSON.parse(shotObj);
            let sessId = shotObj.sessionId;
            let shipSessId = this._spaceship._property._sessionId;
            if (sessId === shipSessId) {
                this._spaceship.firePrimaryAmmo();
            }
        });

    }

    onKeyDown(event) {
        event = event || window.event;

        let keyCode = event.keyCode;
        switch (keyCode) {
            case 87: //w
                this._isMovingUp = true;
                break;
            case 65: //a
                this._isMovingLeft = true;
                break;
            case 83: //s
                this._isMovingDown = true;
                break;
            case 68: //d
                this._isMovingRight = true;
                break;
            case 38: // arrow up
                this._isMovingUp = true;
                break;
            case 37: // arrow left
                this._isMovingLeft = true;
                break;
            case 40: // arrow down
                this._isMovingDown = true;
                break;
            case 39: // arrow right
                this._isMovingRight = true;
                break;
            case 32: // space
                this._isFiring = true;
                break;
        }
    }

    onKeyUp(event) {
        event = event || window.event;

        let keyCode = event.keyCode;
        switch (keyCode) {
            case 87: //w
                this._isMovingUp = false;
                break;
            case 65: //a
                this._isMovingLeft = false;
                break;
            case 83: //s
                this._isMovingDown = false;
                break;
            case 68: //d
                this._isMovingRight = false;
                break;
            case 38: // arrow up
                this._isMovingUp = false;
                break;
            case 37: // arrow left
                this._isMovingLeft = false;
                break;
            case 40: // arrow down
                this._isMovingDown = false;
                break;
            case 39: // arrow right
                this._isMovingRight = false;
                break;
            case 32: // space
                this._isFiring = false;
                break;
        }
    }

    // actual movement of spaceship
    moveSpaceShip(movementObj) {
        let direction = movementObj.direction;
        if (direction) {
            if (direction === OBJ_MOVEMENT.UP) {
                this._spaceship.moveUp();
            }
            if (direction === OBJ_MOVEMENT.LEFT) {
                this._spaceship.moveLeft();
            }
            if (direction === OBJ_MOVEMENT.DOWN) {
                this._spaceship.moveDown()
            }
            if (direction === OBJ_MOVEMENT.RIGHT) {
                this._spaceship.moveRight();
            }
        }
    }

    control() {

        let moving = this._isMovingUp || this._isMovingLeft || this._isMovingDown || this._isMovingRight;
        if (moving) {
            // send the spaceship movement to server
            let movementObj = {
                "sessionId": this._spaceship._property._sessionId,
                "x": this._spaceship._property._x,
                "y": this._spaceship._property._y,
                "direction": 0
            };

            if (this._isMovingUp) {
                movementObj.direction = OBJ_MOVEMENT.UP;
            }
            if (this._isMovingLeft) {
                movementObj.direction = OBJ_MOVEMENT.LEFT;
            }
            if (this._isMovingDown) {
                movementObj.direction = OBJ_MOVEMENT.DOWN;
            }
            if (this._isMovingRight) {
                movementObj.direction = OBJ_MOVEMENT.RIGHT;
            }

            this._clientSocket.emit(sockConst.MOVE_PLAYER, movementObj);
        }


        if (this._isFiring) {
            let current = new Date();
            let elapsed = current - this._lastFired;

            if (elapsed > this._firingCooldown) {
                let shotObj = {
                    "sessionId": this._spaceship._property._sessionId
                };
                this._clientSocket.emit(sockConst.PLAYER_SHOOTING, shotObj);
                this._lastFired = current;
            }

        }
    }

    randomControl() {
        let x = Math.round(Math.random()) === 1;

        if (x) {
            x = Math.round(Math.random()) === 1;
            this._isMovingLeft = x;
            this._isMovingRight = !x;
        } else {
            this._isMovingLeft = false;
            this._isMovingRight = false;
        }

        x = Math.round(Math.random()) === 1;
        if (x) {
            x = Math.round(Math.random()) === 1;
            this._isMovingUp = x;
            this._isMovingDown = !x;
        } else {
            this._isMovingUp = false;
            this._isMovingDown = false;
        }

        x = Math.round(Math.random()) === 1;
        this._isFiring = x;
    }
}