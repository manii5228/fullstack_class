const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* MySQL connection */
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "vtu24573",
    database: "event_sync"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }
    console.log("MySQL connected");
});

/* WebSocket logic */
io.on("connection", (socket) => {

    /* Send stored events to new client */
    db.query("SELECT * FROM events ORDER BY id DESC", (err, results) => {
        if (!err) {
            socket.emit("sync_history", results);
        }
    });

    /* Receive new event */
    socket.on("new_event", (event) => {

        const query = "INSERT INTO events (message) VALUES (?)";

        db.query(query, [event.message], (err, result) => {
            if (err) return;

            const savedEvent = {
                id: result.insertId,
                message: event.message,
                timestamp: new Date()
            };

            io.emit("broadcast_event", savedEvent);
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});