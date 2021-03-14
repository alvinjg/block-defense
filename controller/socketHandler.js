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
        let gameSession = {
            "id": sessId,
            "name": myUtil.genRandomName()
        };

        // send generated session
        clientSocket.emit(constants.SEND_GAME_SESSION, JSON.stringify(gameSession));
        // client request for old session
        clientSocket.on(constants.SESSION_REQUEST, (gameSessionId)=>{
            let sess = gameEnv.session[gameSessionId];
            if(sess){
                // return old session
                clientSocket.emit(constants.SEND_GAME_SESSION, JSON.stringify(sess));
                return;
            }else{
                clientSocket.emit(constants.SESSION_NOT_EXIST);
            }
        });
        clientSocket.on(constants.CLIENT_SESSION_ESTABLISHED, ()=>{
            gameEnv.session[sessId] = gameSession;
        });
        clientSocket.on(constants.CHECK_ONGOING_GAME, (gameSessionId)=>{
            let gameId = gameEnv.clientToGameMapping[gameSessionId];
            if(gameId){
                let fullUrl = '/gamelobby/' + gameId;
                clientSocket.emit(constants.HAS_ONGOING_GAME, fullUrl);
                return;
            }
            clientSocket.emit(constants.HAS_ONGOING_GAME, "");
        });

        // Game Lobby
        clientSocket.on(constants.INIT_GAME_LOBBY, (sessionId)=>{
            let gameId = gameEnv.clientToGameMapping[sessionId];
            clientSocket.join(gameId);
        });
        // automatically join client to a game
        clientSocket.on(constants.JOIN_GAME, (obj)=>{
            let game = gameEnv.allGames[obj.gameId];
            if(game){ 
                gameEnv.clientToGameMapping[obj.sessionId] = obj.gameId;
            }
        });
    });
}



module.exports = socketHandler;