const constants = require('./socketConstants');
const gameEnv = require('./gameEnvironment');
const gameCtrlFactory = require('./gameControllerFactory');
const obj = require("./gameObjectsProperty");


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
                    let canvas = gameCanvasData.canvasInfo;

                    let startX = Math.round(canvas.width / 5);
                    let startY = Math.floor(canvas.height / 1.2);

                    let ctr = 1;
                    for (let player of game.players) {
                        let spacecraftProp = new obj.SpacecraftProperty();
                        spacecraftProp._sessionId = player.id;
                        spacecraftProp._color = player.color;
                        spacecraftProp._playerName = player.name;

                        // start position of player in canvas
                        let tempStartX = startX + (((spacecraftProp._totalRadius * 2) + 5) * ctr);
                        let xBoundary = canvas.width - spacecraftProp._totalRadius;
                        if (tempStartX > xBoundary) {
                            tempStartX = xBoundary
                        }
                        spacecraftProp._x = tempStartX;
                        spacecraftProp._y = startY;

                        gameCanvasData.spacecrafts.set(player.id, spacecraftProp);
                        ctr++;
                    }

                    game.canvasData = gameCanvasData;

                    // Create a Server Game Controller for the created Game.
                    gameCtrlFactory.createController(io, game);
                    gameCtrlFactory.initializeController(game.gameID);
                    gameCtrlFactory.runController(game.gameID);
                } else {
                    gameCanvasData = game.canvasData;
                }

                clientSocket.join(game.gameID);

                // attach client to notify its game controller from any events
                gameCtrlFactory.attachSocketToController(clientSocket, game.gameID);

                let gameCopy = JSON.parse(JSON.stringify(game));
                let canvasDataCopy = JSON.parse(JSON.stringify(gameCanvasData));
                // Convert Maps to Array
                canvasDataCopy.spacecrafts = Array.from(gameCanvasData.spacecrafts.values());
                canvasDataCopy.asteroids = Array.from(gameCanvasData.asteroids.values());
                gameCopy.players = Array.from(game.players.values())

                gameCopy.canvasData = canvasDataCopy;

                clientSocket.emit(constants.INIT_GAME_CANVAS, JSON.stringify(gameCopy));
                
                gameCtrlFactory.refreshClient(clientSocket, game.gameID);
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