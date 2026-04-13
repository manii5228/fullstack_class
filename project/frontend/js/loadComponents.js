async function loadHTML(id, file) {
    const res = await fetch("../components/" + file);
    const text = await res.text();
    document.getElementById(id).innerHTML = text;
    
    // Dynamically attach Logout logic to avoid CSP inline script violation
    if (file === "navbar.html") {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const token = localStorage.getItem("token");
                if (token && typeof CONFIG !== 'undefined') {
                    // Fire-and-forget logout request to backend
                    fetch(CONFIG.API_BASE_URL + "/auth/logout", {
                        method: "POST",
                        headers: { "Authorization": "Bearer " + token }
                    }).catch(e => console.error(e));
                }
                localStorage.removeItem("token");
                window.location.href = "login.html";
            });
        }
    }
}

loadHTML("navbar", "navbar.html");
loadHTML("sidebar", "sidebar.html");