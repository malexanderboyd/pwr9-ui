function subscribeToUpdates(socket, cb) {

    socket.onopen = function (event) {

    };

    socket.onmessage = function (event) {
        cb(null, JSON.parse(event.data))
    }

    // socket.on('timer', timestamp => cb(null, timestamp));
    // socket.emit('subscribeToUpdates', 1000);
}

const sockets = {}


const openNewGameSocket = (port) => {
    if (!sockets.hasOwnProperty(port)) {
        sockets[port] = new WebSocket(`ws://api.librajobs.org:${port}/ws`);
    }
    return sockets[port]
}

export {subscribeToUpdates, openNewGameSocket}