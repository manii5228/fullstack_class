// Highlight on hover
function highlight(element) {
    element.style.backgroundColor = "#ffffcc";
}

function removeHighlight(element) {
    element.style.backgroundColor = "white";
}

// Reusable error function
function showError(id, message) {
    document.getElementById(id).innerText = message;
}

// Validate Name (only letters)
function validateName(event) {
    let char = event.key;
    if (!/^[a-zA-Z ]$/.test(char)) {
        showError("nameError", "Only letters allowed");
        event.preventDefault();
    } else {
        showError("nameError", "");
    }
}

// Validate Email characters
function validateEmail(event) {
    let char = event.key;
    if (!/^[a-zA-Z0-9@._]$/.test(char)) {
        showError("emailError", "Invalid character");
        event.preventDefault();
    } else {
        showError("emailError", "");
    }
}

// Double-click submit
function submitForm() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;

    if (name === "" || email === "") {
        alert("Please fill all required fields!");
        return;
    }

    document.getElementById("message").innerHTML =
        "<h3 style='color:green'>Feedback Submitted Successfully!</h3>";
}