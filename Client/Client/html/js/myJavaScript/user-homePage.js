$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://localhost:7061/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";


    function setTomorrowAsPlaceholder() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const year = tomorrow.getFullYear();
        const month = ("0" + (tomorrow.getMonth() + 1)).slice(-2);
        const day = ("0" + tomorrow.getDate()).slice(-2);

        const formattedDate = `${year}-${month}-${day}`;
        $('#newReservationDate').val(formattedDate);
    }

    // Call function to set the placeholder on page load
    setTomorrowAsPlaceholder();

    // Load and display the next reservation
    function loadNextReservation() {
        const userData = JSON.parse(sessionStorage.getItem('res'));
        if (userData && userData.userId) {
            const api = `${apiBaseUrl}/Users/reservationList?userId=${userData.userId}`;
            ajaxCall("GET", api, null, postLoadNextReservationSuccess, postLoadReservationsError);
        } else {
            console.error("User data not found in session storage.");
        }
    }

    function postLoadNextReservationSuccess(response) {
        const reservations = response;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextReservation = reservations.find(reservation => {
            const reservationDate = new Date(reservation.reservation_Date);
            reservationDate.setHours(0, 0, 0, 0);
            return reservationDate >= today;
        });

        if (nextReservation) {
            // Build HTML content with textboxes for each reservation detail
            const reservationDetailsHtml = `
            <div class="mb-3">
                <label>Date</label>
                <input type="text" class="form-control" value="${formatDate(nextReservation.reservation_Date)}" readonly>
            </div>
            <div class="mb-3">
                <label>Status</label>
                <input type="text" class="form-control" value="${nextReservation.reservation_Status}" readonly>
            </div>
            <div class="mb-3">
                <label>Start Time</label>
                <input type="text" class="form-control" value="${formatTime(nextReservation.reservation_STime)}" readonly>
            </div>
            <div class="mb-3">
                <label>End Time</label>
                <input type="text" class="form-control" value="${formatTime(nextReservation.reservation_ETime)}" readonly>
            </div>
            <div class="mb-3">
                <label>Mark ID</label>
                <input type="text" class="form-control" value="${nextReservation.markId}" readonly>
            </div>
        `;

            // Insert the HTML content into the #next-reservation-details div
            $('#next-reservation-details').html(reservationDetailsHtml);
        } else {
            $('#next-reservation-details').html('<p>No upcoming reservations found.</p>');
        }
    }


    // Helper functions to format date and time
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatTime(timeString) {
        return timeString.slice(0, 5); // Extracts HH:MM from HH:MM:SS
    }


    function postLoadReservationsError(error) {
        console.error("Error loading reservations:", error);
        alert('Failed to load reservations. Please try again.');
    }


    // Handle new reservation form submission
    $('#newReservationForm').on('submit', function (event) {
        event.preventDefault();
        const reservationDate = $('#newReservationDate').val();
        const reservationSTime = $('#newReservationStartTime').val();
        const reservationETime = $('#newReservationEndTime').val();
        const userData = JSON.parse(sessionStorage.getItem('res'));

        if (reservationSTime >= reservationETime) {
            alert('Start time cannot be greater than or equal to the end time.');
            return;
        }

        if (userData && userData.userId) {
            const reservationData = {
                reservationId: 0,
                userId: userData.userId,
                parkId: 1,
                reservation_Date: reservationDate,
                reservation_STime: reservationSTime,
                reservation_ETime: reservationETime,
                reservation_Status: "Pending",
                markId: 0
            };

            const apiUrl = `${apiBaseUrl}/Reservations/newReservation`;
            ajaxCall("POST", apiUrl, JSON.stringify(reservationData), postReservationSuccess, postReservationError);
        } else {
            console.error("User data not found in session storage.");
            alert('User not logged in.');
        }
    });

    function postReservationSuccess(response) {
        alert('Reservation created successfully!');
        loadNextReservation(); // Refresh next reservation
        $('#newReservationForm')[0].reset(); // Reset form fields
    }

    function postReservationError(error) {
        console.error("Error creating reservation:", error);
        alert('Failed to create reservation. Please try again.');
    }

    loadNextReservation(); // Load the next reservation on page load
});
