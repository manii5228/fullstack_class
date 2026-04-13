document
.getElementById("loginForm")
.addEventListener(
"submit",

async function(e){

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try{

        const data =
        await apiRequest(
            "/auth/login",
            "POST",
            {
                email,
                password
            }
        );

        localStorage.setItem(
            "token",
            data.token
        );

        window.location.href =
            "dashboard.html";

    }
    catch(err){

        document.getElementById(
            "errorMsg"
        ).innerText =
            err.message || "Login failed";
    }

});
function logout(){

localStorage.removeItem("token");

fetch(
CONFIG.API_BASE_URL+"/auth/logout",
{
method:"POST"
});

window.location.href="login.html";

}