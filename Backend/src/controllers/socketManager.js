import { Server } from "socket.io";

let connections = {} // Tracks all active connections for each room

export const connectToSocket = (server) => {
    const io = new Server(server , {
        cors : {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"], 
            credentials: true
        }
    })

    let players = {};
    io.on("connection", (socket) => {
        players[socket.id] = {name : socket.handshake.query.name, socketId : socket.id};
        console.log("Something Connected");
        io.emit("user-connected", players);

        socket.on("join-call", (table) => {
            if(connections[table] === undefined) {
                connections[table] = [];
            }
            if(connections[table].length < 2 && connections[table].indexOf(socket.id) === -1) {
                connections[table].push(socket.id);
            }
            console.log("table : ", table);
            if(connections[table].indexOf(socket.id) === -1) {
                return;
            }
            
            console.log("connected socket's in table : " , connections[table]);

            for(let a = 0; a < connections[table].length; ++a) {
                io.to(connections[table][a]).emit("user-joined", socket.id, connections[table]);
            }
        });

        socket.on("show-video", (table) => {
            if(!connections[table] || connections[table].length < 2) {
                io.to(socket.id).emit("show-video", (table));
            }
        })

        socket.on("remove-video", (table) => {
            if(connections[table] && connections[table].length > 0) {
                for(let a = 0; a < connections[table].length; ++a) {
                    io.to(connections[table][a]).emit("remove-video");
                }
                delete connections[table];
            } else {
                io.to(socket.id).emit("remove-video");
            }
        })

        socket.on("video-event-on", () => {
            io.to(socket.id).emit('video-event-on');
        })

        socket.on("video-event-off", (roomId) => {
            if(connections[roomId]) {
                for(let a = 0; a < connections[roomId].length; ++a) {
                    io.to(connections[roomId][a]).emit('video-event-off');
                }
                delete connections[roomId];
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("player-move", (data) => {
            io.emit("player-move", data);
        });

        socket.on("disconnect", () => {
            delete players[socket.id];
            console.log(`User disconnected: ${socket.id}`);
            io.emit("user-disconnected", socket.id);
            var key;

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for(let a = 0; a < v.length; a++) {
                    if(v[a] === socket.id) {
                        key = k;

                        // Notify all users in the room that this user has left
                        for(let a = 0; a < connections[key].length; a++) {
                            io.to(connections[key][a]).emit('remove-video');
                        }

                        // Remove the user's socket ID from the room
                        let index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);

                        // Delete the room if no users remain
                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }
        });
    })

    return io;
}