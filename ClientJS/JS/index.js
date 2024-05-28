$(document).ready(function () {

    $("#submitbutton").click(submitLogIn);
    let port = "7157";
    server = `https://localhost:${port}`;
})

function submitLogIn() {
    let m = {
        UserId: 0,
        UserEmail: $("#email").val(),
        UserPassword: $("#password").val(),
        UserName: "string",
        UserLastName: "string",
        UserCarNum: "string",
        UserPhone: "string",
        isAdmin: true,
        isManager: true
    }

    api = server + "/api/Users/LogIn";

    ajaxCall("POST", api, JSON.stringify(m), postSCB, postECB);
    return false;
}


function postSCB(res) {
    if (res === 1) {
        console.log("Login Admin successful");
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("isAdmin", "true");

        const email = $("#email").val();
        sessionStorage.setItem("email", email);

        window.location.href = 'admin.html';
    }
    else if (res === 2) {
        console.log("Login Manager successful");
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("isManager", "true");

        const email = $("#email").val();
        sessionStorage.setItem("email", email);

        window.location.href = 'Manager.html';
    }
    else if (res === 3) {
        console.log("Login User successful");
        sessionStorage.setItem("isLoggedIn", "true");

        const email = $("#email").val();
        sessionStorage.setItem("email", email);

        window.location.href = 'userHome.html';
    }
    else
        alert("Email or Password inccorect");
}

/postECB מקבלת תשובה מהשרת דרך החתימה/
function postECB(err) {
    console.log(err);
}