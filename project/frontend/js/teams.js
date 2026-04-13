async function loadTeams(){
    try {
        const teams = await apiRequest("/teams");
        const teamList = document.getElementById('teamList');
        if (!teamList) return;
        
        teamList.innerHTML = teams.map(t => `
        <div class="card">
        <h3>${t.team_name}</h3>
        <p style="color: var(--text-muted); margin-top: 10px;">Manager ID: ${t.manager_id}</p>
        </div>
        `).join("");
    } catch (e) {
        console.error("Failed to load teams:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnCreateTeam = document.getElementById("btnCreateTeam");
    if (btnCreateTeam) {
        btnCreateTeam.addEventListener("click", async () => {
            const teamName = document.getElementById("teamName");
            const managerId = document.getElementById("managerId");
            
            try {
                await apiRequest("/teams", "POST", {
                    team_name: teamName.value,
                    manager_id: parseInt(managerId.value) || null
                });
                
                teamName.value = "";
                managerId.value = "";
                
                loadTeams();
            } catch (err) {
                alert("Error creating team: " + err.message);
            }
        });
    }

    loadTeams();
});