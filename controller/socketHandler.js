const socketio = require('socket.io');
const uuid = require('uuid');
const constants = require('./socketConstants');
const myUtil = require('./utils');
const gameEnv = require('./gameEnvironment');

const socketHandler = (server) => {

    const io = socketio(server);

    io.on('connection', (clientSocket) => {
        console.log(`Socket ${clientSocket.id} has been Connected.`);

        let sessId = uuid.v4();
        let gameSession = gameEnv.sessionTemplate();
        gameSession.id = sessId;
        gameSession.name = myUtil.genRandomName();

        // send generated session
        clientSocket.emit(constants.SEND_GAME_SESSION, JSON.stringify(gameSession));
        // client request for old session
        clientSocket.on(constants.SESSION_REQUEST, (gameSessionId) => {
            let sess = gameEnv.session[gameSessionId];
            if (sess) {
                // return old session
                clientSocket.emit(constants.SEND_GAME_SESSION, JSON.stringify(sess));
                return;
            } else {
                clientSocket.emit(constants.SESSION_NOT_EXIST);
            }
        });
        clientSocket.on(constants.CLIENT_SESSION_ESTABLISHED, () => {
            gameEnv.session[sessId] = gameSession;
            gameEnv.socketToSessionMapping[clientSocket.id] = sessId;
        });
        clientSocket.on(constants.CHECK_ONGOING_GAME, (gameSessionId) => {
            let gameId = gameEnv.clientToGameMapping[gameSessionId];
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
                    delete gameEnv.clientToGameMapping[sessId];

                    // remove player from created game
                    let game = gameEnv.allGames[gameId];
                    if (game) {
                        if (!game.isStarted) {
                            for (let player of game.players.values()) {
                                if (player.id === sessId) {
                                    game.players.delete(player);
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
            let gameId = gameEnv.clientToGameMapping[sessionId];
            if (gameId) {
                let game = gameEnv.allGames[gameId];

                clientSocket.join(gameId);
                let player = gameEnv.session[sessionId];
                game.players.add(player);
            }
        });
        // automatically join client to a game
        clientSocket.on(constants.JOIN_GAME, (obj) => {
            let game = gameEnv.allGames[obj.gameId];
            if (game) {
                gameEnv.clientToGameMapping[obj.sessionId] = obj.gameId;
                let player = gameEnv.session[obj.sessionId];
                game.players.add(player);
                clientSocket.join(game.gameID);;

                let gamecopy = JSON.parse(JSON.stringify(game));
                gamecopy.players = Array.from(game.players);
                io.to(obj.gameId).emit(constants.PLAYER_JOINED, JSON.stringify(gamecopy));
            }
        });

    });
}



module.exports = socketHandler;