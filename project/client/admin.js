const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user || user.role!=="admin")

location.href="/login.html";

/* create user */

function addUser(){

fetch("/addUser",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:
document.getElementById("u").value,

password:
document.getElementById("p").value

})

})
.then(()=>alert("user created"));

}

/* load events */

fetch("/allEvents")

.then(r=>r.json())

.then(data=>{

data.forEach(e=>{

document
.getElementById("tbl")
.innerHTML+=`

<tr>

<td>${e.username}</td>

<td>${e.message}</td>

<td>${e.priority}</td>

<td>${e.category}</td>

<td>${new Date(e.timestamp).toLocaleString()}</td>

</tr>

`;

});

});

/* logout */

function logout(){

localStorage.clear();

location.href="/login.html";

}