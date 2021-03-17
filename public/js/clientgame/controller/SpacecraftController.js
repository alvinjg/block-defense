class SpacecraftController {

    constructor(spaceship) {
        this._spaceship = spaceship;

        this._isMovingUp = false;
        this._isMovingLeft = false;
        this._isMovingRight = false;
        this._isMovingDown = false;
        this._isFiring = false;

        this._firingCooldown = 100;
        this._lastFired = new Date();
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

    control() {

        if (this._isMovingUp) {
            this._spaceship.moveUp();
        }
        if (this._isMovingLeft) {
            this._spaceship.moveLeft();
        }
        if (this._isMovingDown) {
            this._spaceship.moveDown()
        }
        if (this._isMovingRight) {
            this._spaceship.moveRight();
        }

        if (this._isFiring) {
            let current = new Date();
            let elapsed = current - this._lastFired;

            if (elapsed > this._firingCooldown) {
                this._spaceship.firePrimaryAmmo();
                this._lastFired = current;
            }

        }
    }

    randomControl() {
        let x = Math.round(Math.random()) === 1;
        
        if(x){
            x = Math.round(Math.random()) === 1;
            this._isMovingLeft = x;
            this._isMovingRight = !x;
        }else{
            this._isMovingLeft = false;
            this._isMovingRight = false;
        }
        
        x = Math.round(Math.random()) === 1;
        if(x){
            x = Math.round(Math.random()) === 1;
            this._isMovingUp = x;
            this._isMovingDown = !x;
        }else{
            this._isMovingUp = false;
            this._isMovingDown = false;
        }

        x = Math.round(Math.random()) === 1;
        this._isFiring = x;
    }
}