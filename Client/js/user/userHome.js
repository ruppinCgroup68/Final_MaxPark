$(document).ready(function () {

    // Declare the API URL at the top of the script
    const apiBaseUrl = 'http://localhost:7061/api';

    // Function to load and display only the next reservation
    function loadNextReservation() {
        let userData = JSON.parse(sessionStorage.getItem('res'));
        if (userData && userData.userId)
        {
            if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
            {
                api = `http://localhost:7061/api/Users/reservationList?userId=${userData.userId}`;
            }
            else
            {
                api = `https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Users/reservationList?userId=${userData.userId}`;
            }

            ajaxCall("GET", api, null, postLoadNextReservationSuccess, postLoadReservationsError);
        }
        else
        {
            console.error("User data not found in session storage.");
        }
    }

    function postLoadNextReservationSuccess(response) {
        let reservations = response;

        // Get today's date without the time part
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the first reservation with a start date >= today
        let nextReservation = reservations.find(reservation => {
            let reservationDate = new Date(reservation.reservation_Date);
            reservationDate.setHours(0, 0, 0, 0);
            return reservationDate >= today;
        });

        if (nextReservation) {
            let date = formatDate(nextReservation.reservation_Date);
            let stime = formatTime(nextReservation.reservation_STime);
            let etime = formatTime(nextReservation.reservation_ETime);
            let status = nextReservation.reservation_Status;
            let statusClass = '';

            // Determine the class based on status
            if (status === "הזמנה בהמתנה") {
                statusClass = 'waiting';
            } else if (status === "נדחה" || status === "בוטל") {
                statusClass = 'denied';
            } else if (status === "אושר") {
                statusClass = 'approved';
            }

            // Display the next reservation in the HTML
            let nextReservationHtml = `<div class="reservation-details">
                          <p><strong>${date}</strong> | <strong>${stime} - ${etime}</strong> | <strong class="status ${statusClass}">${status}</strong></p>
                       </div>`;
            $('#next-reservation').html(nextReservationHtml);
        } else {
            $('#next-reservation').html('<p>No reservations found.</p>');
        }
    }


    function postLoadReservationsError(error) {
        console.error("Error loading reservations:", error);
        alert('Failed to load reservations. Please try again.');
    }

    function formatDate(dateString) {
        let date = new Date(dateString);
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`; // Format as YYYY-MM-DD to match the date picker format
    }

    function formatTime(timeString) {
        // Extract hours and minutes from the time string
        return timeString.slice(0, 5); // Assumes timeString is in the format "HH:MM:SS"
    }

    // Modal handling
    var modal = document.getElementById("reservationModal");
    var btn = document.querySelector(".big-circle-button");
    var span = document.getElementsByClassName("close")[0];

    // Open the modal when the button is clicked
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // Close the modal when the 'x' is clicked
    span.onclick = function () {
        modal.style.display = "none";
    }

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Handle form submission
    $('#submitReservation').click(function () {
        let reservationDate = $('#reservationDate').val();
        let reservationSTime = $('#reservationSTime').val();
        let reservationETime = $('#reservationETime').val();

        let userData = JSON.parse(sessionStorage.getItem('res'));

        // Check if start time is greater than or equal to end time
        if (reservationSTime >= reservationETime) {
            alert('Start time cannot be greater than or equal to the end time.');
            return; // Stop form submission
        }

        if (userData && userData.userId) {
            let reservationData = {
                reservationId: 0,
                userId: userData.userId,  // Use userId from session storage
                parkId: 1,  // Default value
                reservation_Date: reservationDate,
                reservation_STime: reservationSTime,
                reservation_ETime: reservationETime,
                reservation_Status: "Pending",  // Default status
                markId: 0  // Default value
            };

            if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
            {
                apiUrl = `${apiBaseUrl}/Reservasions/newReservation`;
            }
            else
            {
                apiUrl = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Reservasions/newReservation";
            }

            // Make the AJAX call to create a new reservation
            ajaxCall("POST", apiUrl , JSON.stringify(reservationData), postReservationSuccess, postReservationError);
        } else {
            console.error("User data not found in session storage.");
            alert('User not logged in.');
        }
    });

    function postReservationSuccess(response) {
        alert('Reservation created successfully!');
        $('#reservationModal').hide(); // Close the modal on success
    }

    function postReservationError(error) {
        console.error("Error creating reservation:", error);
        alert('Failed to create reservation. Please try again.');
    }

    // Load the first reservation only on userHome.html
    loadNextReservation();
});
