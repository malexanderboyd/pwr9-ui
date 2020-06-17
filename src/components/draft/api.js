function subscribeToUpdates(socket, cb) {

    socket.onopen = function (event) {

    };

    socket.onmessage = function (event) {
        cb(null, JSON.parse(event.data))
    }

    socket.addEventListener('close', () => {
        cb(null, {type:"socket_close"})
    })

}

const sockets = {}


const openNewGameSocket = (port) => {
    // deployed ws://localhost:80/gd/${port}/ws
    if (!sockets.hasOwnProperty(port)) {
        sockets[port] = new WebSocket(`ws://localhost:${port}/ws`);
    }
    return sockets[port]
}

export {subscribeToUpdates, openNewGameSocket}