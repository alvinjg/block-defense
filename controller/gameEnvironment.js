
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
            "isStarted": false
        };
    },
    sessionTemplate: function () {
        return {
            "id": "",
            "name": "",
            "color": "#aaaaaa",
            "isConnected": false
        };
    }
};

module.exports = gameEnv;