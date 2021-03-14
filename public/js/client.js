const sockConst = {
    SEND_GAME_SESSION: 1,
    SESSION_REQUEST: 2,
    CLIENT_SESSION_ESTABLISHED: 3,
    SESSION_NOT_EXIST: 4
};

let myGameSession = {};
let myGameSessionKey = "GameSessionID";
let localSessionId = window.localStorage.getItem(myGameSessionKey);

(() => {
    const clientSocket = io();

    let tempGameSession = {};
    clientSocket.on(sockConst.SEND_GAME_SESSION, (gameSession) => {
        tempGameSession = JSON.parse(gameSession);
        if (localSessionId) {
            if (localSessionId !== tempGameSession.id) {
                // request for old session
                clientSocket.emit(sockConst.SESSION_REQUEST, localSessionId);
            } else {
                sessionEstablished(clientSocket, tempGameSession)
            }
        } else {
            sessionEstablished(clientSocket, tempGameSession)
        }
    });
    clientSocket.on(sockConst.SESSION_NOT_EXIST, () => {
        sessionEstablished(clientSocket, tempGameSession)
    });
})();

function sessionEstablished(clientSocket, tempGameSession) {
    clientSocket.emit(sockConst.CLIENT_SESSION_ESTABLISHED);
    myGameSession = tempGameSession;
    window.localStorage.setItem(myGameSessionKey, myGameSession.id);
    setHome_playerName(myGameSession.name);
}