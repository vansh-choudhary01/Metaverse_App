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
            if(connections[table].indexOf(socket.id) === -1) {
                connections[table].push(socket.id);
            }
            console.log("connected socket's in 1st table : " , connections[table]);

            for(let a = 0; a < connections[table].length; ++a) {
                io.to(connections[table][a]).emit("user-joined", socket.id);
            }
        });

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
            // var key;

            // for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
            //     for(let a = 0; a < v.length; a++) {
            //         if(v[a] === socket.id) {
            //             key = k;

            //             // Notify all users in the room that this user has left
            //             for(let a = 0; a < connections[key].length; a++) {
            //                 io.to(connections[key][a]).emit('user-left', socket.id);
            //             }

            //             // Remove the user's socket ID from the room
            //             let index = connections[key].indexOf(socket.id);
            //             connections[key].splice(index, 1);

            //             // Delete the room if no users remain
            //             if (connections[key].length === 0) {
            //                 delete connections[key];
            //             }
            //         }
            //     }
            // }
        });
    })

    return io;
}