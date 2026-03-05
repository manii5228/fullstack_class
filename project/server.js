const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const db = mysql.createConnection({
host:"localhost",
user:"root",
password:"vtu24573",
database:"event_sync"
});

db.connect(()=>console.log("MySQL connected"));

let activeUsers = new Set();

io.on("connection",(socket)=>{

activeUsers.add(socket.id);
io.emit("user_count",activeUsers.size);

db.query("SELECT * FROM events ORDER BY id DESC LIMIT 100",(err,res)=>{
if(!err) socket.emit("sync_history",res);
});

socket.on("new_event",(event)=>{

console.log("Event received:", event);
db.query(
"INSERT INTO events (user,message,priority,category,timestamp) VALUES (?,?,?,?,NOW())",
[event.user,event.message,event.priority,event.category],
(err,result)=>{

if(err){
console.log("DB ERROR:",err);
return;
}

console.log("Event inserted:",result.insertId);


const savedEvent={
id:result.insertId,
user:event.user,
message:event.message,
priority:event.priority,
category:event.category,
timestamp: new Date().toLocaleString()};

io.emit("broadcast_event",savedEvent);
});

});

socket.on("disconnect",()=>{
activeUsers.delete(socket.id);
io.emit("user_count",activeUsers.size);
});

});

server.listen(3000,()=>console.log("Server running on http://localhost:3000"));