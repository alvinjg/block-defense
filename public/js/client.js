const sockConst = {
    SEND_GAME_SESSION: 1,
    SESSION_REQUEST: 2,
    CLIENT_SESSION_ESTABLISHED: 3,
    SESSION_NOT_EXIST: 4,
    CHECK_ONGOING_GAME:5,
    HAS_ONGOING_GAME:6,
    INIT_GAME_LOBBY: 7,
    JOIN_GAME: 8
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

    setHome_sessionId(myGameSession.id);
    setHome_playerName(myGameSession.name);

    initPage(clientSocket);
}

function initPage(clientSocket) {
    let hostPath = window.location.pathname;

    // check if needs redirection
    if (hostPath.length < 2) {
        clientSocket.emit(sockConst.CHECK_ONGOING_GAME, myGameSession.id);
        clientSocket.on(sockConst.HAS_ONGOING_GAME, (url) => {
            if (url.length > 0) {
                window.location.replace(url);
            }
        });
    }

    if (hostPath.indexOf("gamelobby") > -1) {
        initGameLobby(clientSocket);
    }
}

function initGameLobby(clientSocket) {
    
    clientSocket.emit(sockConst.JOIN_GAME, {
        sessionId: myGameSession.id, 
        gameId: getGameIdFromUrl()
    });

    clientSocket.emit(sockConst.INIT_GAME_LOBBY);

}

function getGameIdFromUrl(){
    let hostPath = window.location.pathname;
    let matcher = /(?<=gamelobby\/)(\d+)/g;
    return matcher.exec(hostPath)[0];
}