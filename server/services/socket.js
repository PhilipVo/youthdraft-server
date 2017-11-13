const socketio = require('socket.io');
const jwtKey = require('../../keys/keys').jwtKey;
const jwt = require('jsonwebtoken');
function init(server) {
    var io = socketio(server);
    io.on('connection', (socket) => {
        console.log("socket connected");
        socket.on('join-league', (token) => {
          jwt.verify(token, jwtKey, (err, decode) => {
            if (!err) {
              let room = decode.id
              if (decode.league) {
                room = decode.league
              }
              socket.join(room);
              socket.emit('success', 'success')
            } else {
              socket.emit('invalidToken', 'invalidToken')
            }
          })
        });
    });
    return io;
}

module.exports = init;
