async function loadDashboard(){

const data =
await apiRequest(
"/analytics/dashboard"
);

document
.getElementById("totalTasks")
.innerText=data.total_tasks;

document
.getElementById("completed")
.innerText=data.completed_percent+"%";

document
.getElementById("overdue")
.innerText=data.overdue;

document
.getElementById("users")
.innerText=data.active_users;

}

loadDashboard();