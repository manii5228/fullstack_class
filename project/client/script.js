const socket = io();

const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user)

location.href=
"/login.html";

document
.getElementById(
"profileName"
)
.innerText=
user.username;

/* enter key */

document
.getElementById(
"eventInput"
)
.addEventListener(
"keypress",
e=>{

if(e.key==="Enter")

sendEvent();

});

/* counters */

let eventCounter=0;

let perSecond=0;

setInterval(()=>{

document
.getElementById("rate")
.innerText=perSecond;

perSecond=0;

},1000);

/* send event */

function sendEvent(){

const msg=
document
.getElementById(
"eventInput"
).value;

const priority=
document
.getElementById(
"priority"
).value;

const category=
document
.getElementById(
"category"
).value;

socket.emit(
"new_event",
{

user_id:user.id,

username:user.username,

message:msg,

priority,

category

});

document
.getElementById(
"eventInput"
).value="";

}

/* display */

function addEvent(e){

const li=
document
.createElement("li");

li.innerHTML=
`<b>${e.user}</b>
[${e.priority}]
[${e.category}]
<br>
${e.message}
<br>
${e.timestamp}`;

document
.getElementById(
"eventList"
)
.prepend(li);

eventCounter++;

perSecond++;

document
.getElementById(
"eventCount"
)
.innerText=
eventCounter;

}

/* realtime */

socket.on(
"sync_history",
data=>{

data.reverse()
.forEach(addEvent);

});

socket.on(
"broadcast_event",
addEvent
);

socket.on(
"user_count",
c=>{

document
.getElementById(
"userCount"
)
.innerText=c;

});

/* profile stats */

fetch(
`/userStats/${user.id}`
)

.then(r=>r.json())

.then(d=>{

document
.getElementById(
"totalEvents"
)
.innerText=d.total;

});

/* github grid */

fetch(
`/contribution/${user.id}`
)

.then(r=>r.json())

.then(data=>{

const grid=
document
.getElementById(
"contributionGrid"
);

const map={};

data.forEach(d=>{

map[d.day]=
d.count;

});

for(let i=0;i<120;i++){

const cell=
document
.createElement("div");

const date=
new Date();

date.setDate(
date.getDate()-i
);

const key=
date
.toISOString()
.slice(0,10);

const count=
map[key]||0;

cell.className=
"cell level"+
Math.min(count,4);

grid.appendChild(cell);

}

});

/* search */

document
.getElementById(
"searchBox"
)
.addEventListener(
"input",
e=>{

const t=
e.target.value
.toLowerCase();

document
.querySelectorAll("li")

.forEach(li=>{

li.style.display=

li.innerText
.toLowerCase()

.includes(t)

? "block"
: "none";

});

});

/* logout */

function logout(){

localStorage.clear();

window.location.href=
"/login.html";

}