const sockConst = {
    SEND_GAME_SESSION: 1,
    SESSION_REQUEST: 2,
    CLIENT_SESSION_ESTABLISHED: 3,
    SESSION_NOT_EXIST: 4,
    CHECK_ONGOING_GAME: 5,
    HAS_ONGOING_GAME: 6,
    INIT_GAME_LOBBY: 7,
    JOIN_GAME: 8,
    PLAYER_JOINED: 9,
    PLAYER_DISCONNECT: 10,
    START_GAME: 11,
    GAME_STARTED: 12,
    INIT_GAME_CANVAS: 13
};

const startGameButton = document.querySelector("#startGameButton");
const gameCanvas = document.querySelector("#game-canvas");

let myGameSession = {};
let myGameSessionKey = "GameSessionID";
let localSessionId = null;

(() => {
    localSessionId = window.localStorage.getItem(myGameSessionKey);
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
            } else {
                initHome();
            }
        });
    }
    // redirect when game started
    clientSocket.on(sockConst.GAME_STARTED, (urlpath) => {
        let loc = window.location;
        let hostname = loc.protocol + '//' + loc.hostname + ":" + loc.port;
        window.location.replace(hostname + "/" + urlpath);
    });

    if (hostPath.indexOf("gamelobby") > -1) {
        initGameLobby(clientSocket);
    } else if (hostPath.indexOf("gamepage") > -1) {
        initGamePage(clientSocket)
    }
}

function initHome() {
    setHome_display();
}

function initGameLobby(clientSocket) {

    clientSocket.emit(sockConst.JOIN_GAME, {
        sessionId: myGameSession.id,
        gameId: getGameIdFromUrl()
    });

    clientSocket.emit(sockConst.INIT_GAME_LOBBY, myGameSession.id);
    setLobby_showStartGame(myGameSession.id);

    clientSocket.on(sockConst.PLAYER_JOINED, (gameStr) => {
        let game = JSON.parse(gameStr);
        setLobby_refreshPlayerTile(game.players);
    });

    clientSocket.on(sockConst.PLAYER_DISCONNECT, (gameStr) => {
        let game = JSON.parse(gameStr);
        setLobby_refreshPlayerTile(game.players);
    });

    setLobby_display();

    initGameLobbyEvent(clientSocket);
}

function initGameLobbyEvent(clientSocket) {
    if (startGameButton) {
        startGameButton.addEventListener("click", () => {
            clientSocket.emit(sockConst.START_GAME, myGameSession.id);
        });
    }
}

function getGameIdFromUrl() {
    let hostPath = window.location.pathname;
    let matcher = /(?<=gamelobby\/)(\d+)/g;
    return matcher.exec(hostPath)[0];
}

function initGamePage(clientSocket) {
    setGamePage_display();
    initGameCanvas(gameCanvas, clientSocket, myGameSession);
}