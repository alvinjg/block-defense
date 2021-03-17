const TEAM_TYPE = { "ALLY": 0, "ENEMY": 2 };
const OBJ_MOVEMENT = {
    "UP": 1,
    "DOWN": 2,
    "LEFT": 3,
    "RIGHT": 4
};

class CanvasObjectProperty {

    constructor() {
        this._x = 0;
        this._y = 0;
        this._speed_x = 0;
        this._speed_y = 0;
        this._radius = 5;
        this._totalRadius = this._radius;               // accumulated boundary of an object. ex. radius + strokeWidth
    }
}

class LivingObjectProperty extends CanvasObjectProperty {
    constructor() {
        super();
        this._fullLife = 100;
        this._currentLife = 100;
        this._team = TEAM_TYPE.ALLY;
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
        this._radius = 50;
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
    }
}