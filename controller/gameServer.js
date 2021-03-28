const constants = require('./socketConstants');
const gameEnv = require('./gameEnvironment');

const TEAM_TYPE = { "ALLY": 0, "ENEMY": 2 };
const OBJ_MOVEMENT = {
    "IDLE": 0,
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
        this._target_x = this._x;
        this._target_y = this._y;
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

const gameServer = (io, clientSocket) => {

    clientSocket.on(constants.INIT_GAME_CANVAS, (sessionId) => {
        const gameid = gameEnv.clientToGameMapping[sessionId];

        if (gameid) {
            let game = gameEnv.allGames[gameid];

            if (game) {
                // initialize canvas data
                let gameCanvasData = null;
                if (game.canvasData === null || game.canvasData === undefined) {
                    gameCanvasData = gameEnv.gameCanvasTemplate();
                    gameCanvasData.leaderId = game.leader;
                    game.canvasData = gameCanvasData;

                    for (let player of game.players) {
                        let spacecraftProp = new SpacecraftProperty();
                        spacecraftProp._sessionId = player.id;
                        spacecraftProp._color = player.color;

                        gameCanvasData.spacecrafts.set(player.id, spacecraftProp);
                    }

                } else {
                    gameCanvasData = game.canvasData;
                }

                clientSocket.join(game.gameID);

                let canvasDataCopy = JSON.parse(JSON.stringify(gameCanvasData));
                canvasDataCopy.spacecrafts = Array.from(gameCanvasData.spacecrafts.values());
                clientSocket.emit(constants.INIT_GAME_CANVAS, JSON.stringify(canvasDataCopy));
            }
        }
    });

    clientSocket.on(constants.MOVE_PLAYER, (movementObj) => {
        let sessionId = movementObj.sessionId;
        const gameid = gameEnv.clientToGameMapping[sessionId];
        if (gameid) {
            let game = gameEnv.allGames[gameid];
            let canvasData = game.canvasData;

            let spacecraft = canvasData.spacecrafts.get(sessionId);
            spacecraft._x = movementObj.x;
            spacecraft._y = movementObj.y;

            io.to(gameid).emit(constants.MOVE_PLAYER, JSON.stringify(movementObj));
        }
    });

    clientSocket.on(constants.PLAYER_SHOOTING, (shotObj) => {
        let sessionId = shotObj.sessionId;
        const gameid = gameEnv.clientToGameMapping[sessionId];
        if (gameid) {
            io.to(gameid).emit(constants.PLAYER_SHOOTING, JSON.stringify(shotObj));
        }
    });
};

module.exports = gameServer;