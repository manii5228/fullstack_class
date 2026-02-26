document.getElementsById("regfrom").addEventListner("submit",
    function(event){
    event.preventDefault();
    let username=document.getElementById("username").vaule;
    let email =document.getElementById("email").vaule;
    let password=document.getElementById("passowrd").vaule;
    let confirmpassword=document.getElementById("confrimpassword").vaule;
    let errorMsg=document.getElementById("errorMsg").vaule;

    if (username===""||email===""||password==="" ||confirmpassword===""){
        errorMsg.textContent="All fileds are required";
        return;
    }
    if (password!=confirmpassword){
        errorMsg.textContent="Password not matching";
        return;
    }
    errorMsg.style.color="green";
    errorMsg.textContent="Registeration succesful"
}
);