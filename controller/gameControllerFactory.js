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
            this._enemyList.splice(0,1); // remove the enemy group that already sent
        }
    }

    createAsteroid() {
        let astProp = new obj.AsteroidProperty();
        astProp._id = uuid.v4();

        let canvas = this._canvasData.canvasInfo;
        astProp._x = Math.floor(canvas.width / 2) - Math.floor(astProp._width / 2);
        astProp._y = 20;

        this._canvasData.asteroids.set(astProp._id, astProp);
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

    // delete asteroid from the Game Canvas
    deleteAsteroid(asteroidId) {
        let asteroid = this._canvasData.asteroids.get(asteroidId);

        if (asteroid && asteroid._id === asteroidId) {
            this._canvasData.asteroids.delete(asteroidId);
            this._io.in(this._gameID).emit(constants.ASTEROID_DESTROYED, asteroidId);
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
            // gController.createAsteroid();
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
            gController.deleteAsteroid(asteroidId);
        });
    }
};

const gameControllerFactory = new GameControllerFactory();

module.exports = gameControllerFactory;