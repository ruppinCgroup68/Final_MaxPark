document.addEventListener('DOMContentLoaded', function () {
    server = "http://localhost:7061";
    const rowsPerPage = 5;
    let currentPage = 1;


    function onLoadUsersSuccess(response) {
        const users = response;

        // Clear the table before appending new rows
        $('#usersTable tbody').empty();

        users.forEach((user, index) => {
            const rowHtml = `
                <tr>
                    <td>${user.userId}</td>
                    <td>${user.userFirstName}</td>
                    <td>${user.userLastName}</td>
                    <td>${user.userEmail}</td>
                    <td>${user.userCarNum}</td>
                    <td>${user.userPhone}</td>
                    <td><input type="checkbox" ${user.isActive ? 'checked' : ''} disabled></td>
                    <td>
                        <button class="btn btn-gray btn-xs edit-btn">✏️</button>                        
                    </td>
                </tr>`;
            $('#usersTable tbody').append(rowHtml);
        });

        renderTable(); // Update the pagination and visibility of rows
    }

    function onLoadUsersError(error) {
        console.error('Failed to load users:', error);
        alert('Failed to load users. Please try again.');
    }

    function onAddUserSuccess(response) {
        console.log('User added successfully:', response);
        alert('User added successfully!');
        $('#addUserModal').hide();
        $('#addUserForm')[0].reset();
        loadUsers(); // Reload the users table
    }

    function onAddUserError(error) {
        console.error('Failed to add user:', error);
        alert('Failed to add user. Please try again.');
    }

    function onUpdateUserSuccess(response) {
        console.log('User updated successfully:', response);
        alert('User updated successfully!');
    }

    function onUpdateUserError(error) {
        console.error('Failed to update user:', error);
        alert('Failed to update user. Please try again.');
    }

    // Function to load user data via AJAX
    function loadUsers() {
        if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
            api = server + "/api/Admin/users";
        }
        else {
            api = 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/users';
        }

        ajaxCall('GET', api, null, onLoadUsersSuccess, onLoadUsersError);
    }

    function renderTable() {
        const table = document.getElementById("usersTable");
        const rows = Array.from(table.rows).slice(1); // skip the header row

        rows.forEach((row, index) => {
            row.style.display = (index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage) ? "" : "none";
        });

        document.getElementById("prevPage").disabled = currentPage === 1;
        document.getElementById("nextPage").disabled = currentPage === Math.ceil(rows.length / rowsPerPage);
    }

    window.showAddUserModal = function () {
        $('#addUserModal').show();
    };

    $('#closeModal, #cancelBtn').click(function () {
        $('#addUserModal').hide();
    });

    $(window).click(function (event) {
        if (event.target == $('#addUserModal')[0]) {
            $('#addUserModal').hide();
        } else if (event.target == $('#deleteConfirmModal')[0]) {
            $('#deleteConfirmModal').hide();
        }
    });

    $('#addUserForm').submit(function (e) {
        e.preventDefault();

        const userFirstName = $('#userFirstName').val();
        const userLastName = $('#userLastName').val();
        const userEmail = $('#userEmail').val();
        const userPassword = $('#userPassword').val();
        const userCarNum = $('#userCarNum').val();
        const userPhone = $('#userPhone').val();
        const notificationCode = $('#notificationCode').val();
        const isActive = $('#isActive').is(':checked');

        // Validate email and phone number
        if (!userEmail.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!/^05\d-\d{7}$/.test(userPhone)) {
            alert('Please enter a valid phone number in the format 05X-XXXXXXX.');
            return;
        }

        // Prepare the data for the AJAX POST request
        const newUserData = {
            userId: 0, // This should be set by the server
            userEmail: userEmail,
            userPassword: userPassword,
            userFirstName: userFirstName,
            userLastName: userLastName,
            userCarNum: userCarNum,
            userPhone: userPhone,
            userImagePath: "",
            isAdmin: false,
            isParkingManager: false,
            notificationCode: "1",
            isActive: isActive
        };

        // Make the AJAX POST request to add the new user

        if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
            api = `${server}/api/Admin/user`;
        }
        else {
            api = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/user";
        }
        ajaxCall('POST', api, JSON.stringify(newUserData), onAddUserSuccess, onAddUserError);
    });

    $('#usersTable').on('click', '.edit-btn', function () {
        var row = $(this).closest('tr');
        if ($(this).text() === '✏️') {
            $(this).text('💾');  // Change to save icon
            row.find('td').not(':last').each(function () {
                var cell = $(this);
                if (cell.index() === 6) {  // For the checkboxes
                    cell.find('input').prop('disabled', false); // Enable checkboxes in edit mode
                } else if (cell.index() != 0) {
                    cell.html('<input type="text" class="form-control" value="' + cell.text() + '">');
                }
            });
        } else {
            // Change back to edit icon
            $(this).text('✏️');

            // Collect the updated data
            const userId = row.find('td').eq(0).text();
            const userFirstName = row.find('td').eq(1).find('input').val();
            const userLastName = row.find('td').eq(2).find('input').val();
            const userEmail = row.find('td').eq(3).find('input').val();
            const userCarNum = row.find('td').eq(4).find('input').val();
            const userPhone = row.find('td').eq(5).find('input').val();
            const isActive = row.find('td').eq(6).find('input').is(':checked');

            // Update the row with the non-editable data
            row.find('td').not(':last').each(function () {
                var cell = $(this);
                if (cell.index() === 6) {  // For the checkboxes
                    cell.find('input').prop('disabled', true); // Disable checkboxes after saving
                } else {
                    cell.html(cell.find('input').val());
                }
            });

            // Prepare the data for the AJAX PUT request
            const updatedUserData = {
                userId: parseInt(userId),
                userEmail: userEmail,
                userPassword: "1234",  // Assuming password is not updated here
                userFirstName: userFirstName,
                userLastName: userLastName,
                userCarNum: userCarNum,
                userPhone: userPhone,  // Assuming phone is not updated here
                userImagePath: "",
                isAdmin: true,
                isParkingManager: true,
                isActive: true,
                notificationCode: "", // Assuming notification code is not updated here

            };

            if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
                api = server + "/api/Admin/user";
            } else {
                api = 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/user';
            }

            // Make the AJAX PUT request to update the user
            ajaxCall('PUT', api, JSON.stringify(updatedUserData), onUpdateUserSuccess, onUpdateUserError);
        }
    });

    $('#prevPage').click(function () {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    $('#nextPage').click(function () {
        if (currentPage * rowsPerPage < $('#usersTable tbody tr').length) {
            currentPage++;
            renderTable();
        }
    });

    loadUsers(); // Load users when the page loads
});

function sortTable(columnIndex) {
    const table = document.getElementById("usersTable");
    const rows = Array.from(table.rows).slice(1);
    const sortedRows = rows.sort(function (a, b) {
        const aText = a.cells[columnIndex].innerText.toLowerCase();
        const bText = b.cells[columnIndex].innerText.toLowerCase();
        return aText.localeCompare(bText);
    });

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    sortedRows.forEach(function (row) {
        table.appendChild(row);
    });

    renderTable();
}

let userId, isActive;

$('#usersTable').on('click', 'input[type="checkbox"]', function () {
    const row = $(this).closest('tr');
    userId = row.find('td').eq(0).text(); // קבלת ה-userId מהשורה
    const isChecked = $(this).is(':checked'); // בדיקה אם הסימון השתנה
    isActive = isChecked; // הגדרת המצב החדש של isActive בהתאם לסימון

    // הצגת מודאל עם הודעת אישור

    $('#confirmText').text(`Are you sure you want to ${isChecked ? 'activate' : 'deactivate'} the user with ID ${userId}?`);
    $('#confirmModal').show();
});


// סגירת המודאל בלחיצה על הכפתורים "x" או "Cancel"
$('#closeConfirmModal, #cancelIsActiveBtn').click(function () {

    $('#confirmModal').hide();
});

// שליחת בקשת PUT לשרת בלחיצה על כפתור "Confirm"
$('#confirmIsActiveBtn').click(function () {
    if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        api = `http://localhost:7061/api/Admin/putIsActive/userId/${userId}/isActive/${isActive}`;
    }
    else {
        api = `https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/putIsActive/userId/${userId}/isActive/${isActive}`;
    }

    ajaxCall('PUT', api, null, isActiveSCB, isActiveECB,);
    return false;
});

function isActiveSCB(res) {
    console.log('User status updated successfully:', res);
    alert('User status updated successfully!');
    $('#confirmModal').hide(); // סגירת המודאל לאחר הצלחה
    loadUsers(); // טעינת המשתמשים מחדש לאחר העדכון
}
function isActiveECB(err) {
    console.log('Failed to update user status:', err);
    alert('Failed to update user status. Please try again.');
    $('#confirmModal').hide(); // סגירת המודאל לאחר שגיאה
}
function loadContent(page) {
    window.location.href = page;
}

function logout() {
    // Clear session storage or any authentication tokens
    sessionStorage.clear(); // Clears all session storage
    localStorage.clear();   // Clears all local storage (if you use it)

    // Redirect to the login page
    window.location.href = '../../login.html';
}