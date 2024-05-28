
$(document).ready(function () {
    $("#smartAlgorithm").hide();
    getReservations();

    $('#show-parking-table').click(function () {
        const totalSlots = parseInt($('#total-parking-slots').val(), 10);
        if (isNaN(totalSlots) || totalSlots < 1) {
            alert("Please enter a valid number of slots.");
            return;
        }
        initializeParkingTable(totalSlots);
    });

    $('#reservationForm').on('submit', function (event) {
        event.preventDefault();

        const startTime = $('#startTime').val();
        const endTime = $('#endTime').val();

        // Validate start and end time
        if (!validateTime(startTime) || !validateTime(endTime)) {
            alert('Please enter a valid time in HH:MM format.');
            return; // Stop here and keep the modal open if validation fails
        }

        AddNewReservation(); // Proceed to add reservation if validation is successful
     });

    $('#submit-parking-table').on('click', function () {
        // Call the API with DELETE method
        ajaxCall('DELETE', 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/deleteParkingMarks', '{}', onDeleteSuccess, onDeleteError);
        $("#smartAlgorithm").show();
    });

    $("#smartAlgorithm").click(function () {
        // Call the API with GET method
        //api = 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/swagger/index.html';
        ajaxCall('GET', 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/SmartAlgorythm/smartAlgorithm', "", getAlgoSuccess, getAlgoError);
    });
});


let slotsArray = [];

function getReservations() {
    // Fetch reservations for tomorrow from the server

    const api = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Reservasions/allReservations";
    ajaxCall("GET", api, "", getSuccess, getError);
}

function initializeParkingTable(totalSlots) {
    const parkingContainer = $('#parking-container');
    parkingContainer.empty(); // Clear previous entries
    slotsArray = []; // Reset the array for fresh initialization
    let modalContent = '<div style="display: flex; flex-wrap: wrap; gap: 20px;">';
    for (let i = 1; i <= totalSlots; i++) {
        slotsArray.push(i.toString());
        modalContent +=
            `<div id="slot${i}" class="slot" style="flex: 0 0 17%; height: 150px; background-color: lightgray; position: relative; border: 1px solid black; box-sizing: border-box;">
                        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">${i}</span>
                        <div class="reservation-details"></div>
                        <button style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); padding: 2px 5px; font-size: 0.8rem;" onclick="splitSlot(${i})">Block</button>
                    </div>`;

        if (i % 5 === 0) {
            modalContent += '<div style="flex-basis: 100%; height: 0;"></div>'; //Ensures that rows break correctly
        }
    }
    modalContent += '</div>';
    parkingContainer.html(modalContent);
}

function splitSlot(slotId) {
    const slot = document.getElementById(`slot${slotId}`);
    slot.classList.add('blocked');
    slot.innerHTML =
        `<div style="width: 100%; height: 65%; position: relative; display: flex; align-items: center; justify-content: center;">
        ${slotId}
        <div class="reservation-details"></div>
    </div>
    <div id="slot${slotId}b" class="slot" style="width: 100%; height: 35%; background-color: #5e8870; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; border-top: 1px solid black;">
        ${slotId}b
        <button style="padding: 2px 5px; font-size: 0.8rem; margin-top: 5px;" onclick="unsplitSlot(${slotId})">Unblock</button>
    </div>`;
    // Ensures the slot height is maintained even after splitting
    slot.style.height = '150px';
}

function unsplitSlot(slotId) {
    const slot = document.getElementById(`slot${slotId}`);
    slot.classList.remove('blocked');
    slot.innerHTML =
        `<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">${slotId}</span>
            <div class="reservation-details"></div>
            <button style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); padding: 2px 5px; font-size: 0.8rem;" onclick="splitSlot(${slotId})">Block</button>`;
    // Restore the original fixed height
    slot.style.height = '150px';
}

function AddNewReservation() {
    const userId = $('#userId').val();
    const parkId = 3; // Assuming parkId is static or derived from another part of your form
    const markId = 0; // Assuming markId is static or derived from another part of your form

    // Get today's date and add one day
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservationDate = tomorrow.toISOString().slice(0, 10); // Tomorrow's date in ISO format
    const startTime = $('#startTime').val() + ":00"; // Append ":00" to match the required "HH:MM:SS" format
    const endTime = $('#endTime').val() + ":00"; // Append ":00" to match the required "HH:MM:SS" format

    const data = JSON.stringify({
        reservationId: 0, // Assuming reservationId is auto-generated by your server
        userId: parseInt(userId),
        parkId: parkId,
        reservation_Date: reservationDate,
        reservation_STime: startTime,
        reservation_ETime: endTime,
        reservation_Status: "pending", // Default or dynamic status
        markId: markId
    });

    // Use ajaxCall to POST data
    ajaxCall('POST', 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Reservasions/newReservation', data, onReservationSuccess, onReservationError);
    return false;
}

function onReservationSuccess(response) {
    console.log('Reservation added successfully:', response);
    $('#reservationModal').modal('hide');
    alert('Reservation added successfully!');
    $('#ReservationsTable').DataTable().ajax.reload(null, false);
}

function onReservationError(error) {
    console.log('Error adding reservation:', error);
    alert('Failed to add reservation. Please try again.');
}

function validateTime(timeStr) {
    // Regular expression to check for HH:MM format
    const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    return regex.test(timeStr);
}


function logSlotsArray() {
    console.log(slotsArray);
}

function updateBlockingOptions(selectedSlot, totalSlots) {
    const selectedValue = $(`#slot${selectedSlot}`).val();
    for (let i = 1; i <= totalSlots; i++) {
        if (i !== selectedSlot) {
            $(`#slot${i} option[value="${selectedSlot}"]`).prop('disabled', selectedValue !== '-');
        }
    }
}



function getSuccess(reservationsData) {
    const table = $('#ReservationsTable').DataTable({
        autoWidth: true,
        data: reservationsData,
        pageLength: 10,
        columns: [
            { data: "reservationId"},
            {
                data: "markId",
                render: function (data, type, row) {
                    if (data > 0) {
                        return '<span style="color: green;">✓</span>';  // Green check mark
                    } else {
                        return '<span style="color: red;">✕</span>';  // Red cross mark
                    }
                }
            },
            { data: "userFullName" },
            { data: "userId" },
            { data: "reservation_STime", className: 'editable' },
            { data: "reservation_ETime", className: 'editable' },
            {
                render: function (data, type, row, meta) {
                    let dataReservation = "data-reservationId='" + row.reservationId + "'";
                    let editBtn = "<button type='button' class='editBtn btn btn-success btn-sm' " + dataReservation + ">Edit</button>";
                    let deleteBtn = "<button type='button' class='deleteBtn btn btn-danger btn-sm' " + dataReservation + ">Delete</button>";
                    return editBtn + deleteBtn;
                }
            }
        ]
    });

    // Attach event handler for delete buttons
    $('#ReservationsTable').on('click', '.deleteBtn', function () {
        const reservationId = $(this).attr('data-reservationId');
        deleteReservation(reservationId);
    });

    // Attach event handler for edit buttons
    $('#ReservationsTable').on('click', '.editBtn', function () {
        const btn = $(this);
        const row = table.row(btn.closest('tr'));
        if (btn.text() === 'Edit') {
            enableEditing(row, btn);
        } else {
            confirmEdit(row, btn);
        }
    });
}

function enableEditing(row, btn) {
    btn.text('Confirm');
    const cells = row.nodes().to$().find('.editable');
    cells.each(function () {
        const cell = $(this);
        const cellData = cell.text();
        cell.html('<input type="text" class="form-control" style="width: 100px;" value="' + cellData + '">');
 });
}

function disableEditableFields(row, newData) {
    const startTimeCell = row.nodes().to$().find('.editable:eq(0)');
    const endTimeCell = row.nodes().to$().find('.editable:eq(1)');

    // Update the DOM elements manually to show the new data and disable input fields
    startTimeCell.html(newData.reservation_STime);
    endTimeCell.html(newData.reservation_ETime);
}


function confirmEdit(row, btn) {

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservationDate = tomorrow.toISOString().slice(0, 10);

    const rowData = row.data();
    const newData = {
        reservationId: rowData.reservationId,  // Get reservationId from existing row data
        userId: rowData.userId,  // Edited user ID
        parkId: 3,  // Assuming parkId is not editable and comes from existing data
        reservation_Date: reservationDate,  // Assuming date is not editable and comes from existing data
        reservation_STime: row.nodes().to$().find('.editable:eq(0) input').val(),  // Edited start time
        reservation_ETime: row.nodes().to$().find('.editable:eq(1) input').val(),  // Edited end time
        reservation_Status: "pending",  // Assuming status is not editable and comes from existing data
        markId: 0  // Assuming markId is not editable and comes from existing data
    };


    ajaxCall('PUT', 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Reservasions/updateReservation', JSON.stringify(newData), function (response) {
        disableEditableFields(row, newData);
        btn.text('Edit');
        alert('Reservation updated successfully!');
        location.reload() 
    }, function (error) {
        console.log('Error updating reservation:', error);
        alert('Failed to update reservation. Please try again.');
    });
    return false;
}

function deleteReservation(reservationId) {
    if (confirm("Are you sure you want to delete this reservation?")) {
        ajaxCall('DELETE', `https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Reservasions/reservationId?reservationId=${reservationId}`, '', onDeleteSuccess, onDeleteError);
    }
}

function onDeleteSuccess(response) {
    $('#ReservationsTable').DataTable().ajax.reload();
    alert('Reservation deleted successfully!');

}

function onDeleteError(error) {
    console.log('Error deleting reservation:', error);
    alert('Failed to delete reservation. Please try again.');
}

function getError(err) {
    alert("Error: " + err);
}


function updateSlots() {
    const slotsData = [];
    $('.slot').each(function () {
        const slotId = this.id.replace('slot', '');
        const markId = 0;  // Default as per specification
        const parkId = 3;  // Default as per specification
        const isBlocked = $(this).hasClass('blocked');  // Assuming 'blocked' class signifies a block
        const markName = slotId;  // Example: Using slot ID as mark name
        const markName_Block = isBlocked ? `${slotId}b` : '-';  // Example logic for blocked slot
        const isAvailable = true;  // Available if not blocked

        slotsData.push({
            markId: markId,
            parkId: parkId,
            markName: markName,
            markName_Block: markName_Block,
            isAvailable: isAvailable
        });
    });


    // Send this structured data as a new AJAX call
    ajaxCall('POST', 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/insertMark', JSON.stringify(slotsData), onPostSuccess, onPostError);

}

// Function to be called when the delete operation is successful
function onDeleteSuccess(response) {

    updateSlots();
}

// Function to be called when the delete operation fails
function onDeleteError(xhr, status, error) {
    updateSlots();

}
function onPostSuccess(response) {
    alert("Parking slots updated successfully.");
}

function onPostError(xhr, status, error) {
    alert("Failed to update parking slots.");
}
function getAlgoSuccess(data)
{
    const reservationsByMark = {};

    // Group reservations by markName
    data.forEach(reservation => {
        const markName = reservation.markName.replace(/b$/, ''); // Strip the 'b' suffix for grouping
        if (!reservationsByMark[markName]) {
            reservationsByMark[markName] = [];
        }
        reservationsByMark[markName].push(reservation);
    });

    // Update the slots with the corresponding reservation details
    Object.keys(reservationsByMark).forEach(markName => {
        const slotA = document.getElementById(`slot${markName}`);
        const slotB = document.getElementById(`slot${markName}b`);

        if (slotA || slotB) {
            // Use slotA as the main container if it exists, otherwise use slotB
            const combinedSlotElement = slotA || slotB;

            // Clear any existing reservation details
            let existingDetails = combinedSlotElement.querySelector('.reservation-details');
            if (existingDetails) {
                existingDetails.innerHTML = '';
            } else {
                existingDetails = document.createElement('div');
                existingDetails.className = 'reservation-details';
                combinedSlotElement.appendChild(existingDetails);
            }

            // Collect and tag reservations from both slotA and slotB
            const combinedReservations = reservationsByMark[markName].map(reservation => ({
                ...reservation,
                slotType: reservation.markName.endsWith('b') ? 'b' : 'a'
            }));

            // Sort reservations by markName length
            const sortedReservationsByMark = combinedReservations.sort((a, b) => {
                aLength = a.markName.length;
                blength = b.markName.length;
                return aLength-blength;
            });

            // Sort reservations by start time
            const sortedReservations = sortedReservationsByMark.sort((a, b) => {
                const [hoursA, minutesA] = a.reservation_STime.split(':').map(Number);
                const [hoursB, minutesB] = b.reservation_STime.split(':').map(Number);
                return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
            });


            if (sortedReservations.length > 0) {
                // Create a table to hold the reservation details
                const table = document.createElement('table');
                table.className = 'reservation-details-table';
                table.innerHTML = `
                    <thead>
                        <tr>                      
                            <th>Reservation Id</th>
                            <th>Mark Name</th>
                            <th>Full Name</th>
                            <th>User Id</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedReservations.map(reservation => `
                            <tr style="background-color: ${reservation.slotType === 'b' ? '#5e8870' : 'transparent'};">
                                <td>${reservation.reservationId}</td>
                                <td>${reservation.markName}</td>
                                <td>${reservation.userFullName}</td>
                                <td>${reservation.userId}</td>
                                <td>${reservation.reservation_STime}</td>
                                <td>${reservation.reservation_ETime}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;

                // Append the reservation details table to the details container
                existingDetails.appendChild(table);

                // Add hover event listeners to show and hide the details
                combinedSlotElement.addEventListener('mouseover', () => {
                    existingDetails.style.display = 'block';
                });

                combinedSlotElement.addEventListener('mouseout', () => {
                    existingDetails.style.display = 'none';
                });
            }
        }
    });
}

function getAlgoError(err) {
    alert("err");
}
