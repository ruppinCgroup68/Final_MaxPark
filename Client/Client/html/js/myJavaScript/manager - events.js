$(document).ready(function () {
    //const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    //    ? "http://localhost:7061/api"
    //    : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    let currentPage = 1;
    const rowsPerPage = 5;

    // Function to load users from the API
    function loadUsers() {
        const api = `${apiBaseUrl}/Admin/users`;
        ajaxCall("GET", api, null, onLoadUsersSuccess, onLoadUsersError);
    }

    function onLoadUsersSuccess(response) {
        const filteredUsers = response;
        paginateUsers(filteredUsers);
    }

    function onLoadUsersError(error) {
        console.error("Failed to load users:", error);
        alert('Failed to load users. Please try again.');
    }

    function paginateUsers(users) {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const paginatedUsers = users.slice(startIndex, startIndex + rowsPerPage);

        displayUsers(paginatedUsers);

        // Enable or disable pagination buttons based on the number of rows in the current page
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', paginatedUsers.length < rowsPerPage);
    }

    function displayUsers(users) {
        const tableBody = $('#usersTable tbody');
        tableBody.empty();

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.userId}</td>
                    <td>${user.userFirstName}</td>
                    <td>${user.userLastName}</td>
                    <td>${user.userEmail}</td>
                    <td>${user.userCarNum}</td>
                    <td>${user.userPhone}</td>
                    <td><input type="checkbox" ${user.isActive ? 'checked' : ''} disabled></td>
                    <td><button class="btn btn-gray btn-xs edit-btn">✏️</button></td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    // Event listener for the add user button
    $('#addUser-btn').click(function () {
        $('#addUserModal').show();
    });

    // Close modal on cancel or outside click
    $('#closeModal, #cancel-btn').click(function () {
        $('#addUserModal').hide();
    });

    $('#addUserForm').submit(function (e) {
        e.preventDefault();

        // Collect form data
        const newUserData = {
            userId: 0, // This should be set by the server
            userEmail: $('#userEmail').val(),
            userPassword: "1234", 
            userFirstName: $('#userFirstName').val(),
            userLastName: $('#userLastName').val(),
            userCarNum: $('#userCarNum').val(),
            userPhone: $('#userPhone').val(),
            userImagePath: "", // Default or placeholder path
            isAdmin: false, // Default value as specified
            isParkingManager: false, // Default value as specified
            notificationCode: "1", // Default notification code
            isActive: $('#isActive').is(':checked')
        };

        // API endpoint for adding a new user
        const api = `${apiBaseUrl}/Admin/user`;

        // AJAX POST request to add a new user
        ajaxCall("POST", api, JSON.stringify(newUserData), onAddUserSuccess, onAddUserError);
    });

    // Callback for successful user addition
    function onAddUserSuccess(response) {
        console.log("User added successfully:", response);
        alert("User added successfully!");
        $('#addUserModal').hide();         // Close the modal
        $('#addUserForm')[0].reset();      // Reset the form
        loadUsers();                       // Refresh the user list
    }

    // Callback for error in user addition
    function onAddUserError(error) {
        console.error("Failed to add user:", error);
        alert("Failed to add user. Please try again.");
    }

    // Event listener for the Edit button in the user table
    $('#usersTable').on('click', '.edit-btn', function () {
        const row = $(this).closest('tr');

        if ($(this).text() === '✏️') {
            $(this).text('💾');  // Change to save icon

            // Convert row cells to input fields for editing
            row.find('td').not(':last').each(function (index) {
                const cell = $(this);
                if (index === 6) {
                    cell.find('input').prop('disabled', false); // Enable checkbox
                } else if (index !== 0) {
                    cell.html(`<input type="text" class="form-control" value="${cell.text()}">`);
                }
            });
        } else {
            $(this).text('✏️'); // Change back to edit icon

            // Collect updated data from input fields
            const updatedUserData = {
                userId: parseInt(row.find('td').eq(0).text()),
                userEmail: row.find('td').eq(3).find('input').val(),
                userPassword: "1234", // Assuming password is not updated here
                userFirstName: row.find('td').eq(1).find('input').val(),
                userLastName: row.find('td').eq(2).find('input').val(),
                userCarNum: row.find('td').eq(4).find('input').val(),
                userPhone: row.find('td').eq(5).find('input').val(),
                userImagePath: "",
                isAdmin: true,
                isParkingManager: true,
                isActive: row.find('td').eq(6).find('input').is(':checked'),
                notificationCode: "" // Assuming notification code is not updated here
            };

            // Update the row with non-editable data
            row.find('td').not(':last').each(function (index) {
                const cell = $(this);
                if (index === 6) {
                    cell.find('input').prop('disabled', true); // Disable checkbox after saving
                } else {
                    cell.html(cell.find('input').val());
                }
            });

            // API endpoint for updating the user
            const api = `${apiBaseUrl}/Admin/user`;

            // AJAX PUT request to update the user
            ajaxCall("PUT", api, JSON.stringify(updatedUserData), onUpdateUserSuccess, onUpdateUserError);
        }
    });

    // Callback for successful user update
    function onUpdateUserSuccess(response) {
        console.log("User updated successfully:", response);
        alert("User updated successfully!");
    }

    // Callback for error in user update
    function onUpdateUserError(error) {
        console.error("Failed to update user:", error);
        alert("Failed to update user. Please try again.");
    }


    $('#nextPage').on('click', function () {
    currentPage++;
    loadUsers();
});

// Event handler for the Previous button
$('#prevPage').on('click', function () {
    if (currentPage > 1) {
        currentPage--;
        loadUsers();
    }
});

    // Load users on page ready
    loadUsers();
});
