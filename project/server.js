const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let eventHistory = [];

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send past events to new client
    socket.emit("sync_history", eventHistory);

    socket.on("new_event", (event) => {
        const enrichedEvent = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...event
        };

        eventHistory.push(enrichedEvent);

        // Broadcast to all clients
        io.emit("broadcast_event", enrichedEvent);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});