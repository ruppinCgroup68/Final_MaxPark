
$(document).ready(function () {
    //const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    //    ? "http://localhost:7061/api"
    //    : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    const getImageApi = "/Users/getPhoto/";
    const defaultProfileImage = "../assets/images/users/default.jpg"; // Path to the default image

    // Function to load the profile image from the server or use a default image
    function loadProfileImageForTop(fileName) {
        const imageApiUrl = `${apiBaseUrl}${getImageApi}${fileName}`;

        $.ajax({
            url: imageApiUrl,
            type: "GET",
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                const imageUrl = URL.createObjectURL(blob);
                $('#profileImage').attr('src', imageUrl);
            },
            error: function () {
                console.error("Failed to load profile image. Using default image.");
                $('#profileImage').attr('src', defaultProfileImage);
            }
        });
    }

    // Function to load user profile fields from session storage and update the HTML
    function loadProfileFieldsForTop() {
        const userData = JSON.parse(sessionStorage.getItem('res'));

        if (userData) {
            const fullName = `${userData.userFirstName || "Unknown"} ${userData.userLastName || "Unknown"}`;

            // Update user name and image on the page
            $('#userName').text(fullName);
            //$('#profileImage').attr('alt', fullName);

            // Load profile image if the path exists; otherwise, use default
            if (userData.userImagePath) {
                loadProfileImageForTop(userData.userImagePath);
            } else {
                $('#profileImage').attr('src', defaultProfileImage);
            }
        } else {
            console.error("No user data found in sessionStorage.");
        }
    }

    $("#logout-btn").click(function () {
        sessionStorage.removeItem("password");
        sessionStorage.removeItem("res");

        window.location.href = "../../../login.html";
    });

    // Initialize by loading the profile fields when document is ready
    loadProfileFieldsForTop();
});

