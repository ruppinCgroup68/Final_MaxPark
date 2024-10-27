$(document).ready(function () {

    $("#submitBtn").click(submitLogIn);
    let port = "7061";
    server = `http://localhost:${port}`;

});

function submitLogIn(event) {
    event.preventDefault(); // מונע מהטופס לשלוח את הנתונים ולרענן את הדף

    let user = {
        userId: 0,
        userEmail: $("#email").val(),
        userPassword: $("#password").val(),
        userFirstName: "string",
        userLastName: "string",
        userCarNum: "string",
        userPhone: "string",
        userImagePath:"string",
        isAdmin: true,
        isParkingManager: true,
        isActive: true,
        notificationCode: "string"
    }
    if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
    {
        //api = server + "/api/Users/LogIn";
        api = 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Users/LogIn';
    }
    else
    {
        api = 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Users/LogIn';
    }
    ajaxCall("POST", api , JSON.stringify(user), postSCB, postECB);
    return false;
}


function postSCB(res) {
    if (typeof res === 'undefined') {
        postECB();
        return; // Exit the function to avoid further execution
    }
    if (res.isAdmin === false && res.isParkingManager === false) {
        if (res.isActive == true)
        {
            console.log("Login User successful");
            sessionStorage.setItem("password", $("#password").val());
            sessionStorage.setItem("res", JSON.stringify(res));
            window.location.href = "crm-maxpark/html/user-homePage.html";
        } else {
            console.log("user is nor active")
            alert("user is not active");
        }
    }
    if (res.isAdmin === true && res.isParkingManager === false)
    {
        window.location.href = "crm-maxpark/html/admin-dashboard.html";
    }
    if (res.isAdmin === false && res.isParkingManager === true)
    {
        window.location.href = "crm-maxpark/html/manager-evenTable.html";

    }
}

//postECB מקבלת תשובה מהשרת דרך החתימה/
function postECB(err) {
    alert("Login failed!");
}