const socket = io();

const list = document.getElementById("eventList");
const input = document.getElementById("eventInput");

let username = localStorage.getItem("username");

if(!username){
username = prompt("Enter your name");
localStorage.setItem("username",username);
}

document.getElementById("profileName").innerText=username;

input.addEventListener("keypress",(e)=>{
if(e.key==="Enter") sendEvent();
});

let eventCounter=0;
let eventsThisSecond=0;

setInterval(()=>{
document.getElementById("rate").innerText=eventsThisSecond;
eventsThisSecond=0;
},1000);

function sendEvent(){

const message=input.value.trim();
if(!message) return;
console.log("Sending event:", message);


const priority=document.getElementById("priority").value;
const category=document.getElementById("category").value;

socket.emit("new_event",{
user:username,
message:message,
priority:priority,
category:category
});

input.value="";
}

function appendEvent(e){

const li=document.createElement("li");

li.innerHTML =
`
<div class="eventHeader">
<b>${e.user}</b>
<span class="tag ${e.priority}">${e.priority}</span>
<span class="tag">${e.category}</span>
</div>

<div class="eventMsg">${e.message}</div>

<small>${e.timestamp}</small>
`;

list.prepend(li);

eventCounter++;
eventsThisSecond++;

document.getElementById("eventCount").innerText=eventCounter;
}

socket.on("connect",()=>{
document.getElementById("connectionStatus").innerText="online";
});

socket.on("sync_history",(history)=>{
history.reverse().forEach(appendEvent);
});

socket.on("broadcast_event",(e)=>{
appendEvent(e);
});

socket.on("user_count",(count)=>{
document.getElementById("userCount").innerText=count;
});

function logout(){

localStorage.removeItem("user");

location.href="/login.html";

}

const user = JSON.parse(localStorage.getItem("user"));

document.getElementById("profileName").innerText=user.username;

fetch(`/userStats/${user.id}`)
.then(res=>res.json())
.then(data=>{

document.getElementById("totalEvents").innerText=data.total;

});
fetch(`/contribution/${user.id}`)
.then(res=>res.json())
.then(data=>{

const grid=document.getElementById("contributionGrid");

const map={};

data.forEach(d=>{
map[d.day]=d.count;
});

for(let i=0;i<365;i++){

const cell=document.createElement("div");

const date=new Date();

date.setDate(date.getDate()-i);

const key=date.toISOString().slice(0,10);

const count=map[key] || 0;

cell.className="cell level"+Math.min(count,4);

grid.appendChild(cell);

}

});
/* search filter */

document.getElementById("searchBox").addEventListener("input",(e)=>{

const term=e.target.value.toLowerCase();

document.querySelectorAll("#eventList li").forEach(li=>{
li.style.display =
li.innerText.toLowerCase().includes(term)
? "block"
: "none";
});

});