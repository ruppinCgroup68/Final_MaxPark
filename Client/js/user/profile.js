$(document).ready(function () {

    localserver = "http://localhost:7157/api";
    server = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    let api = "/Users/updateDetails";
    let updatePasswordApi = "/Users/updatePassword";
    let uploadImageApi = "/Users/savePhoto"; // API for image upload
    let user;
    let getImageApi = "/Users/getPhoto/"; // API for retrieving the photo

    const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"; // Default image URL



    // Function to load profile fields from session storage
    function loadProfileFields() {
        const userData = JSON.parse(sessionStorage.getItem('res'));

        if (userData) {
            console.log("Retrieved userData:", userData);

            $('#email').val(userData.userEmail || "Unknown");
            $('#firstName').val(userData.userFirstName || "Unknown");
            $('#lastName').val(userData.userLastName || "Unknown");
            $('#carNumber').val(userData.userCarNum || "Unknown");
            $('#phoneNumber').val(userData.userPhone || "Unknown");
            $('#modalEmail').val(userData.userEmail || "Unknown"); // Set email in the modal

            // Fetch the user's profile image, or load default image
            if (userData.userImagePath) {
                loadProfileImage(userData.userImagePath);
            } else {
                $('#previewImage').attr('src', defaultProfileImage);
            }
        } else {
            console.error("No user data found in sessionStorage.");
        }

        // Ensure all inputs except the email are disabled on page load
        $('#userProfileForm input:not(#email)').prop('disabled', true);
        $('#toggleEditButton').text('Edit Profile'); // Ensure button text is "Edit Profile" when page loads
        $('#changePictureButton').hide(); // Hide "Change Picture" button initially
    }

    // Function to upload profile picture
    function uploadProfilePicture(file, successCB, errorCB) {
        let formData = new FormData();
        formData.append('files', file);

        if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
        {
            apiToAjax = localserver + uploadImageApi;
        }
        else {
            apiToAjax = server + uploadImageApi;
        }


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

    // Function to handle password change
    function changePassword(event) {
        event.preventDefault();
        let newPassword = $('#newPassword').val();

        if (newPassword === '') {
            alert("Password cannot be empty.");
            return;
        }

        let userData = JSON.parse(sessionStorage.getItem('res'));

        if (userData) {
            let updatedUser = {
                userId: userData.userId,
                userEmail: userData.userEmail,
                userPassword: newPassword,
                userFirstName: userData.userFirstName,
                userLastName: userData.userLastName,
                userCarNum: userData.userCarNum,
                userPhone: userData.userPhone,
                userImagePath: userData.userImagePath || "string",
                isAdmin: userData.isAdmin,
                isParkingManager: userData.isParkingManager,
                isActive: true,
                notificationCode: "string"
            };


            if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
                apiToAjax = localserver + updatePasswordApi;
            }
            else {
                apiToAjax = server + updatePasswordApi;
            }

            ajaxCall("PUT", apiToAjax, JSON.stringify(updatedUser), function (response) {
                alert("Password changed successfully!");
                $('#changePasswordModal').hide();
            }, function (error) {
                alert("Failed to change password.");
            });
        }
    }

    function saveProfile(event) {

        let userData = JSON.parse(sessionStorage.getItem('res'));
        let storedPassword = sessionStorage.getItem('password');

        if (userData) {
            let updatedUser = {
                userId: userData.userId,
                userEmail: $("#email").val(),
                userPassword: String(storedPassword),
                userFirstName: $("#firstName").val(),
                userLastName: $("#lastName").val(),
                userCarNum: $("#carNumber").val(),
                userPhone: String($("#phoneNumber").val()),
                userImagePath: userData.userImagePath || "1",
                isAdmin: userData.isAdmin,
                isParkingManager: userData.isParkingManager,
                isActive: true,
                notificationCode: "1"
            };

            user = updatedUser;

            if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
            {
                apiToAjax = localserver + api;
            }
            else
            {
                apiToAjax = server + api;
            }
            ajaxCall("PUT",apiToAjax , JSON.stringify(updatedUser), postSaveProfileSuccess, postSaveProfileError);
        } else {
            console.error("No user data found in sessionStorage.");
        }

        return false;
    }

    function postSaveProfileSuccess(response) {
        console.log("Profile updated successfully:", response);
        alert('Profile saved successfully!');

        // Update sessionStorage with the latest data
        sessionStorage.setItem('res', JSON.stringify(user));
    }

    function postSaveProfileError(xhr, status, error) {
        if (xhr.status === 200) {
            postSaveProfileSuccess(xhr.responseJSON || xhr.responseText);
        } else {
            console.error('Failed to save profile:', status, error);
            alert('An error occurred while saving the profile. Please try again.');
        }
    }

    // Image preview and upload functionality
    $('#userPicture').on('change', function () {
        const file = this.files[0];
        if (file) {
            // Preview the selected image
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#previewImage').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);

            // Upload the image to the server
            uploadProfilePicture(file, function (response) {
                const imagePath = response[0]; // Get the image path from the response
                console.log("Image uploaded successfully:", imagePath);

                // Update the user's image path in sessionStorage
                let userData = JSON.parse(sessionStorage.getItem('res'));
                userData.userImagePath = imagePath;
                sessionStorage.setItem('res', JSON.stringify(userData));

            }, function (error) {
                console.error('Image upload failed:', error);
                alert('Failed to upload image. Please try again.');
            });
        }
    });

    function loadProfileImage(fileName) {

        if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
        {
            imageApiUrl = localserver + getImageApi + fileName;
        }
        else
        {
            imageApiUrl = server + getImageApi + fileName;
        }
        

        $.ajax({
            url: imageApiUrl,
            type: "GET",
            xhrFields: {
                responseType: 'blob' // Expect binary data (image)
            },
            success: function (response) {
                // Create a URL for the image blob and set it as the image source
                let imageUrl = URL.createObjectURL(response);
                $('#previewImage').attr('src', imageUrl); // Set the image source
            },
            error: function (error) {
                console.error('Failed to load image:', error);
                $('#previewImage').attr('src', defaultProfileImage); // Fallback to default image if error
            }
        });
    }

    $('#changePictureButton').on('click', function () {
        $('#userPicture').click();
    });

    // Load profile fields on page load
    loadProfileFields();

    // Toggle Edit button functionality
    $('#toggleEditButton').on('click', function () {
        const isDisabled = $('#userProfileForm input').prop('disabled');

        if (isDisabled) {
            // Switch to Edit mode
            $('#userProfileForm input:not(#email)').prop('disabled', false);
            $('#toggleEditButton').text('Save Profile');
            $('#changePictureButton').show(); // Show the "Change" button
        } else {
            // Save profile changes
            saveProfile();

            // Switch back to View mode
            $('#userProfileForm input').prop('disabled', true);
            $('#toggleEditButton').text('Edit Profile');
            $('#changePictureButton').hide(); // Hide the "Change" button
        }
    });

    $('#changePasswordButton').on('click', function () {
        $('#changePasswordModal').show();
    });

    $("#logoutButton").click(function () {
        sessionStorage.removeItem("password");
        sessionStorage.removeItem("res");

        window.location.href = "../../login.html";
    });

    $('.close').on('click', function () {
        $('#changePasswordModal').hide();
    });

    $('#changePasswordForm').on('submit', changePassword);
});
