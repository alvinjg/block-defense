const obj = require("./gameObjectsProperty");


class AIGameController {
    constructor(clientSocket, game){
        this._game = game;
        this._clientsocket = clientSocket;
        this._canvasData = this._game.canvasData;
    }

    createAsteroid(){
        let astProp = new obj.AsteroidProperty();
        this._canvasData.asteroids.push(astProp);
    }

}

class GameControllerFactory {
    constructor(){
        this._controllerMap = new Map();
    }

    createController(clientSocket, game){
        if(!game.isRunning || this._controllerMap.has(game.gameID)){
            let gameController = new AIGameController(clientSocket, game);
            this._controllerMap.set(game.gameID, gameController);
            game.isRunning = true;
            gameController.createAsteroid();
        }
    }
};

const gameControllerFactory  = new GameControllerFactory();

module.exports = gameControllerFactory;