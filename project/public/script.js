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