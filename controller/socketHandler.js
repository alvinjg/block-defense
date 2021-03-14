const socketio = require('socket.io');
const uuid = require('uuid');

const openSockets = [];

const socketHandler = (server) => {

    const io = socketio(server);
        
    io.on('connection', (socket) => {
        console.log("someone connected ");

        let clientConn = {
            "id": uuid.v4(),
            "name": "player",
            "socket": socket
        };
        openSockets.push(clientConn);
    });
}

module.exports = socketHandler;