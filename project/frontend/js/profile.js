async function loadProfile(){
const data = await apiRequest("/auth/profile");
document.getElementById("completed").innerText = data.completed_tasks;
}

loadProfile();