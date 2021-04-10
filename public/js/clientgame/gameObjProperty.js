const TEAM_TYPE = { "ALLY": 0, "ENEMY": 2 };
const OBJ_MOVEMENT = {
    "IDLE": 0,
    "UP": 1,
    "DOWN": 2,
    "LEFT": 3,
    "RIGHT": 4
};
const MOVEMENT_TYPE = {
    "IDLE":0,
    "DOWN": 1
};
const OBJECT_STATUS = {
    "EXIST": 0,
    "DESTROYED": 1,
    "DELETED": 2
};

class CanvasObjectProperty {

    constructor() {
        this._id = 0;
        this._x = 0;
        this._y = 0;
        this._speed_x = 0;
        this._speed_y = 0;
        this._target_x = this._x;
        this._target_y = this._y;
        this._radius = 5;
        this._totalRadius = this._radius;               // accumulated boundary of an object. ex. radius + strokeWidth
        this._movementType = MOVEMENT_TYPE.DOWN;
        this._status = OBJECT_STATUS.EXIST;
    }
}

class LivingObjectProperty extends CanvasObjectProperty {
    constructor() {
        super();
        this._fullLife = 100;
        this._currentLife = 100;
        this._team = TEAM_TYPE.ALLY;
        this._upBoundary = null;
        this._downBoundary = null;
        this._leftBoundary = null;
        this._rightBoundary = null;
    }

    moveToX(currentX, direction) {
        if (direction === OBJ_MOVEMENT.LEFT) {
            return this.moveLeft();
        } else if (direction === OBJ_MOVEMENT.RIGHT) {
            return this.moveRight();
        }
        return currentX;
    }

    moveToY(currentY, direction) {
        if (direction === OBJ_MOVEMENT.UP) {
            return this.moveUp();
        } else if (direction === OBJ_MOVEMENT.DOWN) {
            return this.moveDown();
        }
        return currentY;
    }

    moveLeft(currentX = this._x, boundary = this._leftBoundary) {
        let newPos = currentX - this._speed_x;
        if (boundary !== null) {
            let bounds = boundary + this._totalRadius;
            if (newPos < bounds) {
                newPos = bounds;
            }
        }
        return newPos;
    }

    moveRight(currentX = this._x, boundary = this._rightBoundary) {
        let newPos = currentX + this._speed_x;
        if (boundary !== null) {
            let bounds = boundary - this._totalRadius;
            if (newPos > bounds) {
                newPos = bounds;
            }
        }
        return newPos;
    }

    moveUp(currentY = this._y, boundary = this._upBoundary) {
        let newPos = currentY - this._speed_y;
        if (boundary !== null) {
            let bounds = boundary + this._totalRadius;
            if (newPos < bounds) {
                newPos = bounds;
            }
        }
        return newPos;
    }

    moveDown(currentY = this._y, boundary = this._downBoundary) {
        let newPos = currentY + this._speed_y;
        if (boundary !== null) {
            let bounds = boundary - this._totalRadius;
            if (newPos > bounds) {
                newPos = bounds;
            }
        }
        return newPos;
    }
}

class AmmoProperty extends CanvasObjectProperty {
    constructor() {
        super();
        this._width = 5;
        this._height = 10;
        this._team = TEAM_TYPE.ALLY;
        this._type = null;
        this._speed_y = 8;
        this._color = '#ffd412';
        this._damage = 1;
    }

    move() {
        this._y -= this._speed_y;
    }
}

class PowerUpProperty extends CanvasObjectProperty {
    constructor() {
        super();
        this._duration = 1000;
    }
}

class PrimaryAmmoProperty extends AmmoProperty {
    constructor() {
        super();
        this._damage = 100;
    }
}

class AsteroidProperty extends LivingObjectProperty {
    constructor() {
        super();
        this._fullLife = 5000;
        this._currentLife = this._fullLife;
        this._team = TEAM_TYPE.ENEMY;
        this._radius = 75;
        this._speed_x = 0.1;
        this._speed_y = 0.5;
        this._y = 0;
        this._width = this._radius;
        this._height = this._radius;
        this._color = '#de1d38';
    }
}


class SpacecraftProperty extends LivingObjectProperty {
    constructor() {
        super();
        this._x = 20;
        this._y = 20;
        this._radius = 10;
        this._speed_x = 4;
        this._speed_y = 4;
        this._weapon1 = null;
        this._weapon2 = null;
        this._color = '#0d1d38';
        this._firedAmmos = [];
        this._sessionId = null; // session of player
        this._strokeWidth = 10;
        this._totalRadius = this._radius + Math.floor(this._strokeWidth/2);
    }
}