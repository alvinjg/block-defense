const obj = require("./gameObjectsProperty");
const constants = require('./socketConstants');


class AIGameController {
    constructor(io, game) {
        this._game = game;
        this._io = io;
        this._gameID = game.gameID;
        this._canvasData = this._game.canvasData;

        let room = this._io.sockets.in(this._gameID);
        room.on(constants.ASTEROID_DESTROYED, (asteroidId) => {
            let asteroids = this._canvasData.asteroids;
            for (let i = 0; i < asteroids.length; i++) {
                let asteroid = asteroids[i];
                console.log(i);
                if (asteroid._id === asteroidId) {
                    console.log("deleted");
                    asteroids.splice(i, 1);
                }
            }
        });
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

        if (elapsed > 3000 && elapsed < 4000) {
            this.sendMoveAsteroid();
        }
    }

    createAsteroid() {
        let astProp = new obj.AsteroidProperty();

        let canvas = this._canvasData.canvasInfo;
        astProp._x = Math.floor(canvas.width / 2) - Math.floor(astProp._width / 2);
        astProp._y = 20;

        this._canvasData.asteroids.push(astProp);
    }

    sendMoveAsteroid() {
        let asteroid = this._canvasData.asteroids[0];
        let move = this.createAsteroidMovement();
        move.id = asteroid._id;
        move.x = asteroid._x + 150;
        move.y = this._canvasData.canvasInfo.height + 20;

        this._io.to(this._gameID).emit(constants.MOVE_ASTEROID, JSON.stringify(move));
    }

    createAsteroidMovement() {
        return {
            "id": null,
            "x": 100,
            "y": 100,
            "timestamp": new Date().getTime()
        };
    }
}

class GameControllerFactory {
    constructor() {
        this._controllerMap = new Map();
    }

    createController(io, game) {
        if (!game.isRunning || this._controllerMap.has(game.gameID)) {
            let gameController = new AIGameController(io, game);
            this._controllerMap.set(game.gameID, gameController);
        }
    }

    initializeController(gameID) {
        let gController = this._controllerMap.get(gameID);
        if (gController) {
            gController.createAsteroid();
        }
    }


    runController(gameID) {
        let gController = this._controllerMap.get(gameID);
        if (gController) {
            gController.runController();
        }
    }
};

const gameControllerFactory = new GameControllerFactory();

module.exports = gameControllerFactory;