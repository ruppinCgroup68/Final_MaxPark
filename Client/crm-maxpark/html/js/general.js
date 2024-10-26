$("#logout-btn").click(function () {
    sessionStorage.removeItem("password");
    sessionStorage.removeItem("res");

    window.location.href = "../../../login.html";
});