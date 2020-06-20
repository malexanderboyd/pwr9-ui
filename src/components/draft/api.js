function subscribeToUpdates(socket, cb) {

    socket.onopen = function (event) {

    };

    socket.onmessage = function (event) {
        cb(null, JSON.parse(event.data))
    }

}

const sockets = {}


const openNewGameSocket = (port) => {
    // deployed ws://localhost:80/gd/${port}/ws
    if (!sockets.hasOwnProperty(port)) {
        sockets[port] = new WebSocket(`ws://pwr9.net:${port}/ws`);
    }
    return sockets[port]
}

export {subscribeToUpdates, openNewGameSocket}