function subscribeToUpdates(socket, cb) {

    socket.onopen = function (event) {

    };

    socket.onmessage = function (event) {
        cb(null, JSON.parse(event.data))
    }

}

const sockets = {}


const openNewGameSocket = (port) => {
    if (!sockets.hasOwnProperty(port)) {
        sockets[port] = new WebSocket(`ws://draft.librajobs.org/gd/${port}/ws`);
    }
    return sockets[port]
}

export {subscribeToUpdates, openNewGameSocket}