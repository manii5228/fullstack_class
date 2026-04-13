const token = localStorage.getItem("token");

if (token) {
    location.href = "pages/dashboard.html";
} else {
    location.href = "pages/login.html";
}
