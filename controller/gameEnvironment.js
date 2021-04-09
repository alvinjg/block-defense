
const gameEnv = {
    allGames: {},
    clientToGameMapping: {
        "sessId": 0
    },
    socketToSessionMapping: {
        "socketId": ""
    },
    session: {
        "sessId": {}
    },
    gameTemplate: function () {
        return {
            "teamName": "",
            "leader": "",
            "gameID": 0,
            "dateCreated": 0,
            "players": new Set(),
            "isStarted": false,
            "isRunning": false,
            "runningSince": 0,
            "canvasData": undefined
        };
    },
    sessionTemplate: function () {
        return {
            "id": "",
            "name": "",
            "color": "#aaaaaa",
            "isConnected": false
        };
    },
    gameCanvasTemplate: function () {
        return {
            "leaderId": null,
            "spacecrafts": new Map(),
            "asteroids": new Map(),
            "canvasInfo": {
                "width": 800,
                "height": 600
            }
        };
    }
};

module.exports = gameEnv;