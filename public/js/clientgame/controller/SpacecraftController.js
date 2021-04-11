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
        this._pendingMovement = this.createMovementObject();
        this._newMovement = this.createMovementObject();
        this._canvasHeight = this._spaceship._canvas.height;
        this._canvasWidth = this._spaceship._canvas.width;

        this._isMoved = false;
        this._movementQueue = [];

        let halfRadius = this._spaceship._property._radius * 0.5;
        this._spaceship._property._upBoundary =  Math.floor(this._canvasHeight * 0.10);
        this._spaceship._property._downBoundary = this._canvasHeight - halfRadius;
        this._spaceship._property._leftBoundary = halfRadius;
        this._spaceship._property._rightBoundary = this._canvasWidth - halfRadius;

        this._clientSocket.on(sockConst.MOVE_PLAYER, (movementObj) => {
            movementObj = JSON.parse(movementObj);
            let sessId = movementObj.sessionId;
            let shipSessId = this._spaceship._property._sessionId;
            if (sessId === shipSessId) {
                let queue = this._movementQueue;
                let lastIndex = queue.length;
                let lastmove = null;
                let earlier = false;
                if (queue.length > 0) {
                    // if movementObj is earlier to the lastmovement, swap it
                    do {
                        lastmove = queue[--lastIndex];
                    } while (lastmove.timestamp > movementObj.timestamp && lastIndex > 0);
                    let steps = (queue.length - 1) - lastIndex;
                    if (steps >= 1) {
                        earlier = true;
                    }
                }
                if (earlier) {
                    queue.splice(lastIndex, 0, movementObj);
                } else {
                    queue.push(movementObj);
                }

                lastmove = queue[queue.length - 1];
                this._spaceship._property._target_x = lastmove.x;
                this._spaceship._property._target_y = lastmove.y

                // remove the first 6 movement in the queue
                if (queue.length > 8) {
                    queue.splice(0, 6);
                }

                let elapsed = new Date() - lastmove.timestamp;
                displayPing(elapsed);
            }
        });

        this._clientSocket.on(sockConst.PLAYER_SHOOTING, (shotObj) => {
            shotObj = JSON.parse(shotObj);
            let sessId = shotObj.sessionId;
            let shipSessId = this._spaceship._property._sessionId;
            if (sessId === shipSessId) {
                this._spaceship.firePrimaryAmmo();
                let elapsed = new Date() - shotObj.timestamp;
                displayPing(elapsed);
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

    // actual movement of spaceship in canvas
    moveSpaceship() {
        let xDirection = this._spaceship._property._target_x - this._spaceship._property._x;
        let yDirection = this._spaceship._property._target_y - this._spaceship._property._y;


        if (Math.abs(xDirection) < this._spaceship._property._speed_x) {
            this._spaceship._property._x += xDirection;
        } else if (xDirection < 0) {
            this._spaceship.moveLeft();
        } else if (xDirection > 0) {
            this._spaceship.moveRight();
        }

        if (Math.abs(yDirection) < this._spaceship._property._speed_y) {
            this._spaceship._property._y += yDirection;
        } else if (yDirection < 0) {
            this._spaceship.moveUp();
        } else if (yDirection > 0) {
            this._spaceship.moveDown();
        }
    }



    control() {
        this.moveSpaceship();

        let moving = this._isMovingUp || this._isMovingLeft || this._isMovingDown || this._isMovingRight;
        if (moving) {
            // send the spaceship movement to server
            let newMovement = this._newMovement;

            if (this._isMovingUp) {
                newMovement.y = this._spaceship._property.moveUp(newMovement.y);
                newMovement.direction = OBJ_MOVEMENT.UP;
            }
            if (this._isMovingLeft) {
                newMovement.x = this._spaceship._property.moveLeft(newMovement.x);
                newMovement.direction = OBJ_MOVEMENT.LEFT;
            }
            if (this._isMovingDown) {
                newMovement.y = this._spaceship._property.moveDown(newMovement.y);
                newMovement.direction = OBJ_MOVEMENT.DOWN;
            }
            if (this._isMovingRight) {
                newMovement.x = this._spaceship._property.moveRight(newMovement.x);
                newMovement.direction = OBJ_MOVEMENT.RIGHT;
            }

            this._isMoved = true;
        }

        if (this._isFiring) {
            let current = new Date();
            let elapsed = current - this._lastFired;

            if (elapsed > this._firingCooldown) {
                let shotObj = {
                    "sessionId": this._spaceship._property._sessionId,
                    "timestamp": new Date().getTime()
                };
                this._clientSocket.emit(sockConst.PLAYER_SHOOTING, shotObj);
                this._lastFired = current;
            }

        }
    }

    sendPendingMovement() {
        if (this._isMoved) {
            this._newMovement.timestamp = new Date().getTime();
            this._clientSocket.emit(sockConst.MOVE_PLAYER, this._newMovement);
            this._isMoved = false;
        }
    }

    createMovementObject() {
        return {
            "sessionId": this._spaceship._property._sessionId,
            "x": this._spaceship._property._x,
            "y": this._spaceship._property._y,
            "direction": OBJ_MOVEMENT.IDLE,
            "timestamp": new Date().getTime(),
            "completed": false
        };
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