$(document).ready(function () {
   // const localserver = "http://localhost:7061/api";
    const localserver = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const server = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1" ? localserver : server;
    const updatePasswordApi = "/Users/updatePassword";
    const updateDetailsApi = "/Users/updateDetails";
    const uploadImageApi = "/Users/savePhoto";
    const getImageApi = "/Users/getPhoto/";
    let user = JSON.parse(sessionStorage.getItem('res'));

    function loadProfileFields() {
        const userData = JSON.parse(sessionStorage.getItem('res'));

        if (userData) {
            $('#fullName').attr('placeholder', `${userData.userFirstName || "Unknown"} ${userData.userLastName || "Unknown"}`);
            $('#email').attr('placeholder', userData.userEmail || "Unknown");
            $('#password').attr('placeholder', "********"); // Display asterisks for security
            $('#phoneNumber').attr('placeholder', userData.userPhone || "Unknown");
            $('#carNumber').attr('placeholder', userData.userCarNum || "Unknown");

            // Load user's profile image or set default
            if (userData.userImagePath) {
                loadProfileImage(userData.userImagePath);
            } else {
                $('#profileImage').attr('src', defaultProfileImage);
            }
        } else {
            console.error("No user data found in sessionStorage.");
        }
    }

    function loadProfileImage(fileName) {
        const imageApiUrl = `${apiBaseUrl}${getImageApi}${fileName}`;

        $.ajax({
            url: imageApiUrl,
            type: "GET",
            xhrFields: {
                responseType: 'blob' // Expect binary data (image)
            },
            success: function (response) {
                // Create a URL for the image blob and set it as the image source
                const imageUrl = URL.createObjectURL(response);
                $('#profileImage').attr('src', imageUrl);
            },
            error: function (error) {
                console.error('Failed to load image:', error);
                $('#profileImage').attr('src', defaultProfileImage); // Fallback to default image if error
            }
        });
    }

    function updateProfile(event) {
        event.preventDefault();

        const newPassword = $('#password').val();
        const storedPassword = sessionStorage.getItem('password');

        // Check if the password needs updating
        if (newPassword) {
            changePassword(newPassword);
        }

        // Check if the profile picture needs updating
        if (selectedFile) {
            uploadProfilePicture(selectedFile, function (response) {
                const imagePath = response[0];
                user.userImagePath = imagePath;  // Update the image path in the user object
                sessionStorage.setItem('res', JSON.stringify(user));
                alert("Profile picture updated successfully!");
            }, function () {
                alert("Failed to upload profile picture.");
            });
        }

        // Check for other updated fields
        let fieldsUpdated = false;
        let updatedUser = { ...user };  // Start with current user data

        // Only update fields if the user entered something
        updatedUser.userEmail = $("#email").val() || user.userEmail;
        updatedUser.userFirstName = $("#firstName").val() || user.userFirstName;
        updatedUser.userLastName = $("#lastName").val() || user.userLastName;
        updatedUser.userCarNum = $("#carNumber").val() || user.userCarNum;
        updatedUser.userPhone = $("#phoneNumber").val() || user.userPhone;

        // Check if any field other than password/photo was changed
        if (
            updatedUser.userEmail !== user.userEmail ||
            updatedUser.userFirstName !== user.userFirstName ||
            updatedUser.userLastName !== user.userLastName ||
            updatedUser.userCarNum !== user.userCarNum ||
            updatedUser.userPhone !== user.userPhone
        ) {
            fieldsUpdated = true;
        }

        // If fields were updated, call saveProfile, else show "Nothing to Update" message
        if (fieldsUpdated) {
            saveProfile(updatedUser);
        } else if (!newPassword && !selectedFile) {
            alert("Nothing to Update");
        }
    }

    // Function to change the password
    function changePassword(newPassword) {
        const updatedUser = {
            ...user,
            userPassword: newPassword
        };

        ajaxCall("PUT", `${apiBaseUrl}${updatePasswordApi}`, JSON.stringify(updatedUser), function (response) {
            alert("Password changed successfully!");
            $('#password').val('');  // Clear password field
        }, function (error) {
            alert("Failed to change password.");
        });
    }

    // Function to save updated profile fields
    function saveProfile(updatedUser) {
        ajaxCall("PUT", `${apiBaseUrl}${updateDetailsApi}`, JSON.stringify(updatedUser), function (response) {
            alert("Profile updated successfully!");
            sessionStorage.setItem('res', JSON.stringify(updatedUser));  // Update session storage
        }, function (error) {
            alert("Failed to update profile.");
        });
    }

    // Function to upload profile picture (using $.ajax directly)
    function uploadProfilePicture(file, successCB, errorCB) {
        const formData = new FormData();
        formData.append('files', file);

        const apiToAjax = `${apiBaseUrl}${uploadImageApi}`;

        $.ajax({
            url: apiToAjax,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: successCB,
            error: errorCB
        });
    }

    // Track selected file on image input change
    $('#imageUpload').on('change', function (event) {
        selectedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#profileImage').attr('src', e.target.result);
        };
        reader.readAsDataURL(selectedFile);
    });

    // Attach updateProfile function to the Update button
    $('#updateProfileButton').on('click', updateProfile);

    loadProfileFields(); // Call function to load profile fields on page load
});
