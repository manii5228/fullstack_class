async function loadTasks(){

const tasks=
await apiRequest("/tasks");

let html="";

tasks.forEach(t=>{

html+=`

<tr>

<td>${t.title}</td>

<td>${t.status}</td>

<td>${t.difficulty}</td>

<td>${t.deadline}</td>

<td>

<button onclick="deleteTask(${t.id})">

Delete

</button>

</td>

</tr>

`;

});

document
.getElementById("taskTable")
.innerHTML=html;

}

async function deleteTask(id){

await apiRequest(
"/tasks/"+id,
"DELETE"
);

loadTasks();

}

function createTask(){
document.getElementById("createForm").style.display="block";
}

async function submitTask(){
const title = document.getElementById("title").value;
const status = document.getElementById("status").value;
const difficulty = document.getElementById("difficulty").value;
const deadline = document.getElementById("deadline").value;

await apiRequest("/tasks", "POST", {title, status, difficulty, deadline});

document.getElementById("createForm").style.display="none";
loadTasks();
}

loadTasks();