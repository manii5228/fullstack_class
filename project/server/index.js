const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
require('dotenv').config({path: '../config/.env'});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));
app.use(express.json());

const db = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME
});

db.connect(()=>console.log("MySQL connected"));

let activeUsers = new Set();

/* LOGIN */

app.post("/login",(req,res)=>{

const {username,password} = req.body;

db.query(
"SELECT * FROM users WHERE username=?",
[username],
async (err,result)=>{

if(result.length===0)
return res.status(401).send("invalid");

const match =
await bcrypt.compare(password,result[0].password);

if(!match)
return res.status(401).send("invalid");

res.send({
id:result[0].id,
username:result[0].username,
role:result[0].role
});

});
});

/* ADMIN CREATE USER */

app.post("/addUser",async(req,res)=>{

const {username,password} = req.body;

const hash =
await bcrypt.hash(password,10);

db.query(
"INSERT INTO users(username,password) VALUES (?,?)",
[username,hash],
()=>res.send("user added")
);

});

/* USER STATS */

app.get("/userStats/:id",(req,res)=>{

db.query(
"SELECT COUNT(*) total FROM events WHERE user_id=?",
[req.params.id],
(err,result)=>{

res.send(result[0]);

});

});

/* CONTRIBUTION DATA */

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

/* ADMIN ALL EVENTS */

app.get("/allEvents",(req,res)=>{

db.query(
`SELECT e.*,u.username
FROM events e
JOIN users u
ON u.id=e.user_id
ORDER BY timestamp DESC`,
(err,result)=>{

res.send(result);

});

});

/* SOCKET */

io.on("connection",(socket)=>{

activeUsers.add(socket.id);

io.emit("user_count",
activeUsers.size);

/* load history */

db.query(
`SELECT e.*,u.username
FROM events e
JOIN users u
ON u.id=e.user_id
ORDER BY id DESC
LIMIT 100`,
(err,result)=>{

socket.emit("sync_history",
result);

});

/* new event */

socket.on("new_event",
(event)=>{

db.query(
`INSERT INTO events
(user_id,message,priority,category)
VALUES (?,?,?,?)`,
[
event.user_id,
event.message,
event.priority,
event.category
],
(err)=>{

if(err){
console.log(err);
return;
}

const savedEvent={

user:event.username,
message:event.message,
priority:event.priority,
category:event.category,
timestamp:new Date()
.toLocaleString()

};

io.emit(
"broadcast_event",
savedEvent
);

});

});

/* disconnect */

socket.on("disconnect",()=>{

activeUsers.delete(
socket.id
);

io.emit(
"user_count",
activeUsers.size
);

});

});

server.listen(
process.env.PORT,
()=>console.log(
`http://localhost:${process.env.PORT}/login.html`
));