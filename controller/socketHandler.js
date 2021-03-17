const socketio = require('socket.io');
const uuid = require('uuid');
const constants = require('./socketConstants');
const myUtil = require('./utils');
const gameEnv = require('./gameEnvironment');
const randColor = require('randomcolor');
const gameServer = require('./gameServer');

const socketHandler = (server) => {

    const io = socketio(server);

    io.on('connection', (clientSocket) => {
        console.log(`Socket ${clientSocket.id} has been Connected.`);

        let sessId = uuid.v4();
        let gameSession = gameEnv.sessionTemplate();
        gameSession.id = sessId;
        gameSession.name = myUtil.genRandomName();
        gameSession.color = randColor();

        // send generated session
        clientSocket.emit(constants.SEND_GAME_SESSION, JSON.stringify(gameSession));
        // client request for old session
        clientSocket.on(constants.SESSION_REQUEST, (gameSessionId) => {
            let sessObj = gameEnv.session[gameSessionId];
            if (sessObj) {
                // return old session
                sessId = sessObj.id;
                gameSession = sessObj;
                clientSocket.emit(constants.SEND_GAME_SESSION, JSON.stringify(gameSession));
                return;
            } else {
                clientSocket.emit(constants.SESSION_NOT_EXIST);
            }
        });
        clientSocket.on(constants.CLIENT_SESSION_ESTABLISHED, () => {
            gameSession.isConnected = true;
            gameEnv.session[gameSession.id] = gameSession;
            gameEnv.socketToSessionMapping[clientSocket.id] = gameSession.id;
        });
        clientSocket.on(constants.CHECK_ONGOING_GAME, (gameSessionId) => {
            let gameId = gameEnv.clientToGameMapping[gameSessionId];

            let game = gameEnv.allGames[gameId];

            if (game) {
                if (game.isStarted && gameId) {
                    let fullUrl = '/gamepage/' + gameId;
                    clientSocket.emit(constants.HAS_ONGOING_GAME, fullUrl);
                    return;
                }
            }
            if (gameId) {
                let fullUrl = '/gamelobby/' + gameId;
                clientSocket.emit(constants.HAS_ONGOING_GAME, fullUrl);
                return;
            }
            clientSocket.emit(constants.HAS_ONGOING_GAME, "");
        });
        clientSocket.on("disconnect", (reason) => {
            let sessId = gameEnv.socketToSessionMapping[clientSocket.id];
            if (sessId) {
                delete gameEnv.socketToSessionMapping[clientSocket.id];

                // remove player game mapping
                let gameId = gameEnv.clientToGameMapping[sessId];
                if (gameId) {
                    // remove player from created game
                    let game = gameEnv.allGames[gameId];
                    if (game) {
                        if (!game.isStarted) {
                            for (let player of game.players.values()) {
                                if (player.id === sessId) {
                                    // game.players.delete(player);
                                    player.isConnected = false;
                                }
                            }
                        }
                        // notify other player that someone disconnected
                        let gamecopy = JSON.parse(JSON.stringify(game));
                        gamecopy.players = Array.from(game.players);
                        io.to(gameId).emit(constants.PLAYER_DISCONNECT, JSON.stringify(gamecopy));
                    }

                }
            }
        });

        // Game Lobby
        clientSocket.on(constants.INIT_GAME_LOBBY, (sessionId) => {
            // let gameId = gameEnv.clientToGameMapping[sessionId];
            // if (gameId) {
            //     let game = gameEnv.allGames[gameId];

            //     clientSocket.join(gameId);
            //     let player = gameEnv.session[sessionId];
            //     game.players.add(player);
            // }
        });
        // automatically join client to a game
        clientSocket.on(constants.JOIN_GAME, (obj) => {
            let game = gameEnv.allGames[obj.gameId];
            if (game) {
                gameEnv.clientToGameMapping[obj.sessionId] = obj.gameId;
                let player = gameEnv.session[obj.sessionId];
                game.players.add(player);
                clientSocket.join(game.gameID);

                let gamecopy = JSON.parse(JSON.stringify(game));
                gamecopy.players = Array.from(game.players);
                io.to(obj.gameId).emit(constants.PLAYER_JOINED, JSON.stringify(gamecopy));
            }
        });
        clientSocket.on(constants.START_GAME, (sessId) => {
            const gameid = gameEnv.clientToGameMapping[sessId];

            if (gameid) {
                let game = gameEnv.allGames[gameid];
                game.isStarted = true;

                let urlPath = 'gamepage/' + gameid;
                io.to(gameid).emit(constants.GAME_STARTED, urlPath);
            }
        });

        // module for the game proper
        gameServer(io, clientSocket);
    });
}



module.exports = socketHandler;