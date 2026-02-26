function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const userError = document.getElementById("userError");
    const passError = document.getElementById("passError");
    const result = document.getElementById("result");

    userError.innerText = "";
    passError.innerText = "";
    result.innerText = "";

    // Validation
    if (username === "") {
        userError.innerText = "Username is required";
        return;
    }

    if (password === "") {
        passError.innerText = "Password is required";
        return;
    }

    // Send to server
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            result.style.color = "green";
        } else {
            result.style.color = "red";
        }
        result.innerText = data.message;
    })
    .catch(() => {
        result.style.color = "red";
        result.innerText = "Server Error";
    });
}