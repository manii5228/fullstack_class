document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault();

  const studentData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    dob: document.getElementById("dob").value,
    department: document.getElementById("department").value,
    phone: document.getElementById("phone").value
  };

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(studentData)
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
  })
  .catch(error => {
    console.log(error);
  });
});