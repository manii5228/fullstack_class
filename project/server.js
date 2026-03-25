const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const mysql = require("mysql2");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const bcrypt = require("bcrypt");
app.use(express.static("public"));
app.use(express.json());
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
app.post("/register", async (req,res)=>{
const {username,password} = req.body;
const hash = await bcrypt.hash(password,10);
db.query(
"INSERT INTO users(username,password) VALUES (?,?)",
[username,hash],
(err)=>{
if(err) return res.status(400).send("user exists");
res.send("registered");
});
});
/* login */
app.post("/login",(req,res)=>{
const {username,password} = req.body;
db.query(
"SELECT * FROM users WHERE username=?",
[username],
async (err,result)=>{
if(result.length===0) return res.status(401).send("invalid");
const match = await bcrypt.compare(password,result[0].password);
if(!match) return res.status(401).send("invalid");
res.send({
id:result[0].id,
username:result[0].username
});
});
});
db.query("SELECT * FROM events ORDER BY id DESC LIMIT 100",(err,res)=>{
if(!err) socket.emit("sync_history",res);
});
socket.on("new_event",(event)=>{
console.log("Event received:", event);
db.query(
"INSERT INTO events (user_id,message,priority,category,timestamp) VALUES (?,?,?,?,NOW())",
[event.user_id,event.message,event.priority,event.category],
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
app.get("/userStats/:id",(req,res)=>{

db.query(
"SELECT COUNT(*) as total FROM events WHERE user_id=?",
[req.params.id],
(err,result)=>{

res.send(result[0]);

});

});
app.get("/contribution/:id",(req,res)=>{
db.query(
`SELECT DATE(timestamp) day,
COUNT(*) count
FROM events
WHERE user_id=?
GROUP BY day`,
[req.params.id],
(err,result)=>{
res.send(result);
});
});
});
server.listen(3000,()=>console.log("Server running on http://localhost:3000"));