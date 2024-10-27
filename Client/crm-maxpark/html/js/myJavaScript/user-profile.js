$(document).ready(function () {
    const localserver = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const server = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1" ? localserver : server;
    const updatePasswordApi = "/Users/updatePassword";
    const updateDetailsApi = "/Users/updateDetails";
    const uploadImageApi = "/Users/savePhoto";
    const getImageApi = "/Users/getPhoto/";
    let user = JSON.parse(sessionStorage.getItem('res'));
    let selectedFile = null;
    let fieldsUpdated = true;
    let updatedUser = { ...user }; // Define updatedUser globally

    function loadProfileFields() {
        const userData = JSON.parse(sessionStorage.getItem('res'));

        if (userData) {
            $('#firstName').attr('placeholder', userData.userFirstName || "Unknown");
            $('#lastName').attr('placeholder', userData.userLastName || "Unknown");
            $('#email').attr('placeholder', userData.userEmail || "Unknown");
            $('#password').attr('placeholder', "********");
            $('#phoneNumber').attr('placeholder', userData.userPhone || "Unknown");
            $('#carNumber').attr('placeholder', userData.userCarNum || "Unknown");

            if (userData.userImagePath) {
                loadProfileImage(userData.userImagePath);
            } else {
                $('#profileImageBig').attr('src', defaultProfileImage);
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
                responseType: 'blob'
            },
            success: handleLoadImageSuccess,
            error: handleLoadImageError
        });
    }

    function handleLoadImageSuccess(response) {
        const imageUrl = URL.createObjectURL(response);
        $('#profileImageBig').attr('src', imageUrl);
    }

    function handleLoadImageError(error) {
        console.error('Failed to load image:', error);
        $('#profileImageBig').attr('src', defaultProfileImage);
    }

    function updateProfile(event) {
        event.preventDefault();

        const newPassword = $('#password').val();

        if (newPassword) {
            changePassword(newPassword);
            fieldsUpdated = true;
        }

        updatedUser.userEmail = $("#email").val() || user.userEmail;
        updatedUser.userFirstName = $("#firstName").val() || user.userFirstName;
        updatedUser.userLastName = $("#lastName").val() || user.userLastName;
        updatedUser.userCarNum = $("#carNumber").val() || user.userCarNum;
        updatedUser.userPhone = $("#phoneNumber").val() || user.userPhone;
        updatedUser.userPassword = "********";

        if (selectedFile) {
            // Upload image first, then proceed to saveProfile in success callback
            uploadProfilePicture(selectedFile, function (response) {
                handleUploadImageSuccess(response);
                updatedUser.userImagePath = user.userImagePath; // Update updatedUser with new image path
                saveProfile(updatedUser); // Call saveProfile after successful image upload
            }, handleUploadImageError);
        } else {
            // If no image selected, proceed to saveProfile directly if fields were updated
            if (fieldsUpdated) {
                saveProfile(updatedUser);
            } else {
                alert("Nothing to Update");
            }
        }
    }

    function changePassword(newPassword) {
        const updatedUser = {
            ...user,
            userPassword: newPassword
        };

        ajaxCall("PUT", `${apiBaseUrl}${updatePasswordApi}`, JSON.stringify(updatedUser), handleChangePasswordSuccess, handleChangePasswordError);
    }

    function handleChangePasswordSuccess() {
        alert("Password changed successfully!");
        $('#password').val('');
    }

    function handleChangePasswordError() {
        alert("Failed to change password.");
    }

    function saveProfile(updatedUser) {
        ajaxCall("PUT", `${apiBaseUrl}${updateDetailsApi}`, JSON.stringify(updatedUser), handleSaveProfileSuccess, handleSaveProfileError);
    }

    function handleSaveProfileSuccess(response) {
        alert("Profile updated successfully!");
        sessionStorage.setItem('res', JSON.stringify(response));
    }

    function handleSaveProfileError() {
        alert("Failed to update profile.");
    }

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
            success: function (response) {
                user.userImagePath = response[0];
                sessionStorage.setItem('res', JSON.stringify(user));  // Update sessionStorage with new image path
                fieldsUpdated = true;
                successCB(response);
            },
            error: errorCB
        });
    }

    function handleUploadImageSuccess(response) {
        const imagePath = response[0];
        user.userImagePath = imagePath;
        sessionStorage.setItem('res', JSON.stringify(user));
    }

    function handleUploadImageError() {
        alert("Failed to upload profile picture.");
    }

    document.getElementById("imageUpload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    // Calculate dimensions to crop to a square
                    const size = Math.min(img.width, img.height);
                    const canvas = document.createElement("canvas");
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext("2d");

                    // Draw the image cropped to a square
                    ctx.drawImage(
                        img,
                        (img.width - size) / 2,
                        (img.height - size) / 2,
                        size,
                        size,
                        0,
                        0,
                        size,
                        size
                    );

                    // Set the square-cropped image as the profile picture
                    document.getElementById("profileImage").src = canvas.toDataURL("image/png");
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });



    $('#imageUpload').on('change', function (event) {
        selectedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#profileImageBig').attr('src', e.target.result);
        };
        reader.readAsDataURL(selectedFile);
    });

    $('#updateProfileButton').on('click', updateProfile);

    loadProfileFields();
});
