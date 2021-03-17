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

        this._ping = new Date();
        this._isMoved = false;
        this._movementQueue = [];
        this._spaceship._property._upBoundary = this._spaceship._property._radius + Math.floor(this._canvasHeight / 3);
        this._spaceship._property._downBoundary = this._canvasHeight;
        this._spaceship._property._leftBoundary = 0;
        this._spaceship._property._rightBoundary = this._canvasWidth;

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
            }

            let elapsed = new Date() - this._ping;
            console.log(`Elapsed time: ${elapsed}ms`);
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
    moveSpaceship() {
        if (this._pendingMovement !== null && !this._pendingMovement.completed) {
            let targetX = this._pendingMovement.x;
            let targetY = this._pendingMovement.y;
            let currX = this._spaceship._property._x;
            let currY = this._spaceship._property._y;
            let allowanceX = this._spaceship._property._speed_x;
            let allowanceY = this._spaceship._property._speed_y;
            let direction = this._pendingMovement.direction;

            let onTarget = (targetPoint, currentPoint, allowance) => {
                let distance = Math.abs(targetPoint - currentPoint);
                if (targetPoint == currentPoint) {
                    return true;
                }
                return false;
            };

            if (direction) {
                let onTargetX = onTarget(targetX, currX, allowanceX);
                let onTargetY = onTarget(targetY, currY, allowanceY);

                if (direction === OBJ_MOVEMENT.UP) {
                    if (!onTargetY) {
                        this._spaceship.moveUp();
                    }
                }
                if (direction === OBJ_MOVEMENT.LEFT) {
                    if (!onTargetX) {
                        this._spaceship.moveLeft();
                    }
                }
                if (direction === OBJ_MOVEMENT.DOWN) {
                    if (!onTargetY) {
                        this._spaceship.moveDown();
                    }
                }
                if (direction === OBJ_MOVEMENT.RIGHT) {
                    if (!onTargetX) {
                        this._spaceship.moveRight();
                    }
                }

                if (onTargetX && onTargetY) {
                    this._pendingMovement.completed = true;
                }
            }
        }
    }

    moveSpaceship2() {
        let queue = this._movementQueue;

        if (queue.length > 0) {
            let indx = queue.length - 1;
            queue.find((element, index) => {
                if (element === this._pendingMovement) {
                    indx = index;
                    return true;
                }
            });

            let nextMove = queue[indx];
            if (!nextMove.completed) {

                let direction = nextMove.direction;
                let point = null;

                // TODO: Interpoate for diagonal movement
                // let x1 = this._spaceship._property._x;
                // let y1 = this._spaceship._property._y;
                // let x2 = (nextMove) ? nextMove.x : this._spaceship._property._x;
                // let y2 = (nextMove) ? nextMove.y : this._spaceship._property._y;
                // let queryX = this._spaceship._property.moveToX(x1, direction);
                // let queryY = this._spaceship._property.moveToY(y1, direction);
                // if (queue.length > 1) {
                //     // find poit for diagonal movement
                //     point = findPointOfLine(x1, y1, x2, y2, queryX, queryY);
                // } else {
                //     point = {
                //         "x": queryX,
                //         "y": queryY
                //     };
                // }
                // this._spaceship._property._x = point.x;
                // this._spaceship._property._y = point.y;

                if (direction === OBJ_MOVEMENT.UP) {
                    this._spaceship.moveUp();
                } else if (direction === OBJ_MOVEMENT.DOWN) {
                    this._spaceship.moveDown();
                } else if (direction === OBJ_MOVEMENT.LEFT) {
                    this._spaceship.moveLeft();
                } else if (direction === OBJ_MOVEMENT.RIGHT) {
                    this._spaceship.moveRight();
                }

                point = {
                    "x": this._spaceship._property._x,
                    "y": this._spaceship._property._y
                };

                if (((direction === OBJ_MOVEMENT.LEFT && point.x <= this._pendingMovement.x) ||
                    (direction === OBJ_MOVEMENT.RIGHT && point.x >= this._pendingMovement.x)) ||
                    (direction === OBJ_MOVEMENT.UP && point.y <= this._pendingMovement.y) ||
                    (direction === OBJ_MOVEMENT.DOWN && point.y >= this._pendingMovement.y)) {
                    this._pendingMovement.completed = true;
                }
            }
        }

        this._spaceship.draw();

        if (queue.length > 0) {
            for (let i = 0; i < queue.length; i++) {
                let movement = queue[i];
                if (movement.completed) {
                    if (queue.length > 2) {
                        queue.splice(i, 1);
                    }
                } else {
                    this._pendingMovement = movement;
                    break;
                }
            }
        }
    }

    control() {
        // this.moveSpaceship();
        this.moveSpaceship2();

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
                    "sessionId": this._spaceship._property._sessionId
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
            this._ping = new Date();
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