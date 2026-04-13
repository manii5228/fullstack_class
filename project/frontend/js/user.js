async function loadUsers(){
    try {
        const users = await apiRequest("/users");
        let html = "";
        users.forEach(u => {
            html += `
            <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            </tr>
            `;
        });
        document.getElementById("userTable").innerHTML = html;
    } catch (e) {
        console.error("Failed to load users:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnCreateUser = document.getElementById("btnCreateUser");
    if (btnCreateUser) {
        btnCreateUser.addEventListener("click", () => {
            document.getElementById("createUserForm").style.display = "block";
        });
    }

    const btnSubmitUser = document.getElementById("btnSubmitUser");
    if (btnSubmitUser) {
        btnSubmitUser.addEventListener("click", async () => {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            try {
                await apiRequest("/users", "POST", {name, email, password, role});
                document.getElementById("createUserForm").style.display = "none";
                
                // Clear fields
                document.getElementById("name").value = "";
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                document.getElementById("role").value = "";

                loadUsers();
            } catch (err) {
                alert("Error creating user: " + err.message);
            }
        });
    }

    loadUsers();
});