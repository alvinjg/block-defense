const obj = require("./gameObjectsProperty");
const constants = require('./socketConstants');
const uuid = require('uuid');
const enemySets = require('./enemySets');

class AIGameController {
    constructor(io, game) {
        this._game = game;
        this._io = io;
        this._gameID = game.gameID;
        this._canvasData = this._game.canvasData;
        this._enemyList = enemySets();
    }

    runController() {
        if (!this._game.isRunning) {
            this._game.isRunning = true;
            this._game.runningSince = new Date().getTime();
            setInterval(() => {
                this.run();
            }, 100);
        }
    }

    run() {
        let elapsed = new Date().getTime() - this._game.runningSince;

        let nextEnemyGroup = this._enemyList[0];
        if (nextEnemyGroup && nextEnemyGroup.attackTime < elapsed) {
            this._io.to(this._gameID).emit(constants.NEW_ENEMY_ATTACK, JSON.stringify(nextEnemyGroup));
            this._enemyList.splice(0, 1); // remove the enemy group that already sent

            // Add the sent asteroid to the servers canvas data
            let controllerObj = this;
            nextEnemyGroup.asteroids.forEach(function (astProp) {
                controllerObj._canvasData.asteroids.set(astProp._id, astProp);
            });
        }

        // no enemy to deploy
        if (this._enemyList && this._enemyList.length === 0) {
            this._io.to(this._gameID).emit(constants.LAST_ENEMY_DEPLOYED);
        }
    }

    // refresh client once reconnected
    refreshClient(clientSocket) {
        clientSocket.emit(constants.UPDATE_TEAM_SCORE, this._game.score);
    }


    // sends the next position of an Asteroid to the clients.
    sendMoveAsteroid() {
        let asteroid = this._canvasData.asteroids.values().next().value;
        if (asteroid) {
            let move = this.createAsteroidMovement();
            move.id = asteroid._id;
            move.x = asteroid._x + 150;
            move.y = this._canvasData.canvasInfo.height + 20;

            this._io.to(this._gameID).emit(constants.MOVE_ASTEROID, JSON.stringify(move));
        }
    }

    createAsteroidMovement() {
        return {
            "id": null,
            "x": 100,
            "y": 100,
            "timestamp": new Date().getTime()
        };
    }

    // delete asteroid destroyed by user from the Game Canvas
    destroyAsteroid(asteroidId) {
        let asteroid = this._canvasData.asteroids.get(asteroidId);

        if (asteroid && asteroid._id === asteroidId) {
            this._canvasData.asteroids.delete(asteroidId);
            this._io.in(this._gameID).emit(constants.ASTEROID_DESTROYED, asteroidId);

            // update score of clients
            this._game.score += asteroid._scoreValue;
            this._io.in(this._gameID).emit(constants.UPDATE_TEAM_SCORE, this._game.score);
        }
    }

    // For cleanup. Remove Asteroid in server model if it is out of client canvas
    removeAsteroidFromModel(asteroidId) {
        let asteroid = this._canvasData.asteroids.get(asteroidId);

        if (asteroid && asteroid._id === asteroidId) {
            this._canvasData.asteroids.delete(asteroidId);
        }
    }

    updateAsteroidPosition(asteroidArray) {
        let controllerObj = this;
        asteroidArray.forEach(function (value) {
            let asteroid = controllerObj._canvasData.asteroids.get(value._id);

            if (asteroid && asteroid._id === value._id) {
                asteroid._x = value._x;
                asteroid._y = value._y;
                asteroid._currentLife = value._currentLife;
                asteroid._radius = value._radius;
            }
        });
    }

    gameOver() {
        if (!this._game.isGameOver) {
            this._game.isGameOver = true;
            let controllerObj = this;
            setTimeout(function () {
                controllerObj._io.in(controllerObj._gameID).emit(constants.GAME_OVER);
            }, 2000);
        }
    }
}


/** 
 * The factory for Game Controller. Each Game has its own controller which is responsible 
 * for sending the enemy to the players of a single game.
 */
class GameControllerFactory {
    constructor() {
        this._controllerMap = new Map();
    }

    // Creation of Server Game Controller of the newly created game.
    createController(io, game) {
        if (!game.isRunning || !this._controllerMap.has(game.gameID)) {
            let gameController = new AIGameController(io, game);
            this._controllerMap.set(game.gameID, gameController);
        }
    }

    // Initialize the Server Game Controller of the game.
    initializeController(gameID) {
        let gController = this._controllerMap.get(gameID);
        if (gController) {
            // no implementation
        }
    }

    // refresh client data on reload
    refreshClient(clientSocket, gameID) {
        let gController = this._controllerMap.get(gameID);
        if (gController) {
            gController.refreshClient(clientSocket);
        }
    }

    // Runs the controller bound with the game ID
    runController(gameID) {
        let gController = this._controllerMap.get(gameID);
        if (gController) {
            gController.runController();
        }
    }

    // Attach the socket of client to its designated Game Controller. This method notifies the Game Controller from any events coming from the client.
    attachSocketToController(clientSocket, gameID) {
        let gController = this._controllerMap.get(gameID);
        clientSocket.on(constants.ASTEROID_DESTROYED, (asteroidId) => {
            gController.destroyAsteroid(asteroidId);
        });
        clientSocket.on(constants.UPDATE_PLAYER_LIFE, (sessionId, currentLife) => {
            let player = gController._canvasData.spacecrafts.get(sessionId);
            if (player) {
                player._currentLife = currentLife;
                gController._io.to(gameID).emit(constants.UPDATE_PLAYER_LIFE, sessionId, currentLife);
            }
        });
        clientSocket.on(constants.PLAYER_IS_IMMUNE, (sessionId, immuneFlag) => {
            let player = gController._canvasData.spacecrafts.get(sessionId);
            if (player) {
                player._immune = immuneFlag;
                gController._io.to(gameID).emit(constants.PLAYER_IS_IMMUNE, sessionId, immuneFlag);
            }
        });
        clientSocket.on(constants.PLAYER_DESTROYED, (sessionId) => {
            let player = gController._canvasData.spacecrafts.get(sessionId);
            if (player) {
                player._status = obj.OBJECT_STATUS.DESTROYED;
                gController._io.to(gameID).emit(constants.PLAYER_DESTROYED, sessionId);
            }
        });
        clientSocket.on(constants.CLEANUP_ASTEROID, (asteroidId) => {
            gController.removeAsteroidFromModel(asteroidId);
        });
        clientSocket.on(constants.UPDATE_ASTEROID, (asteroidArray) => {
            gController.updateAsteroidPosition(JSON.parse(asteroidArray));
        });
        clientSocket.on(constants.GAME_OVER, () => {
            gController.gameOver();
        });
    }
};

const gameControllerFactory = new GameControllerFactory();

module.exports = gameControllerFactory;