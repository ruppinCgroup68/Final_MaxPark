$(document).ready(function () {


    // Declare the API URL at the top of the script
    const apiBaseUrl = 'http://localhost:7061/api';
    let nextReservationDate = "01/01/2020"

    // Function to load the next reservation and update the timer
    function loadNextReservation() {
        let userData = JSON.parse(sessionStorage.getItem('res'));
        if (userData && userData.userId)
        {
            if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
            {
                api = `${apiBaseUrl}/Users/reservationList?userId=${userData.userId}`;
            }
            else
            {
                api = `https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Users/reservationList?userId=${userData.userId}`;
            }
            

            ajaxCall("GET", api, null, postLoadNextReservationSuccess, postLoadReservationsError);
        } else {
            console.error("User data not found in session storage.");
        }
    }

    function postLoadNextReservationSuccess(response) {
        let reservations = response;

        if (reservations.length > 0) {

            // Get the current date and time formatted
            let now = formatDateTime(new Date());

            // Sort reservations by start time (ascending)
            reservations.sort((a, b) => {
                let startTimeA = combineDateAndTime(a.reservation_Date, a.reservation_STime);
                let startTimeB = combineDateAndTime(b.reservation_Date, b.reservation_STime);
                return new Date(startTimeA) - new Date(startTimeB); // Compare date objects
            });


            //For debug change status check to "הזמנה בהמתנה"
            let nextReservation = reservations.find(reservation => {
                let reservationEndTime = combineDateAndTime(reservation.reservation_Date, reservation.reservation_ETime);
                return reservation.reservation_Status === "אישור" && reservationEndTime >= now;
            });

            if (!nextReservation) {
                resetParkingDetails();
                return; // Stop further execution
            }

            // Use the combine function to get a proper date-time string for start and end
            let reservationStartTime = combineDateAndTime(nextReservation.reservation_Date, nextReservation.reservation_STime);
            let reservationEndTime = combineDateAndTime(nextReservation.reservation_Date, nextReservation.reservation_ETime);

            nextReservationDate = new Date(nextReservation.reservation_Date);
            nextReservationDate = ('0' + nextReservationDate.getDate()).slice(-2) + '/' +
                ('0' + (nextReservationDate.getMonth() + 1)).slice(-2) + '/' +
                nextReservationDate.getFullYear();


            // Update parking-details section
            document.getElementById('parking-info').innerHTML = `Parking<br>${nextReservation.parkId}`;
            document.getElementById('slot-info').innerHTML = `Slot<br>${nextReservation.markId}`;
            document.getElementById('start-time').innerHTML = `Start<br>${formatTime(nextReservation.reservation_STime)}`;
            document.getElementById('end-time').innerHTML = `End<br>${formatTime(nextReservation.reservation_ETime)}`;

            if (isToday(reservationStartTime)) {
                if (now >= reservationStartTime && now <= reservationEndTime) {

                    // Calculate time passed percentage
                    let totalDuration = new Date(reservationEndTime) - new Date(reservationStartTime);
                    let timePassed = new Date(now) - new Date(reservationStartTime);
                    let percentagePassed = (timePassed / totalDuration) * 100;

                    // Set the top position based on the time passed
                    document.querySelector('.square').style.setProperty('--start-top', `${percentagePassed}%`);
                    document.querySelector('.square').style.setProperty('--animation-duration', `${(totalDuration - timePassed) / 1000}s`);

                    $('#next-reservation-title').hide();

                    // Calculate time remaining
                    let timeRemaining = new Date(reservationEndTime) - new Date(now);
                    startTimer(Math.floor(timeRemaining / 1000), document.querySelector('#countdown-timer'));
                } else {
                    // Parking has ended or not started yet
                    startTimer(0, document.querySelector('#countdown-timer'));
                    document.querySelector('.square').style.setProperty('--start-top', "100%");
                }
            } else {
                // Reservation is not today
                resetParkingDetails();
            }

        } else {
            resetParkingDetails();
        }
    }

    function combineDateAndTime(dateString, timeString) {
        // Ensure dateString is "YYYY-MM-DD" and timeString is "HH:MM:SS"
        if (typeof dateString === 'string' && typeof timeString === 'string') {
            return `${dateString.split('T')[0]}T${timeString}`;
        } else {
            console.error("Invalid date or time format", dateString, timeString);
            return null;
        }
    }

    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    function formatTime(timeString) {
        return timeString.slice(0, 5); // Assumes timeString is in the format "HH:MM:SS"
    }

    function postLoadReservationsError(error) {
        console.error("Error loading reservations:", error);
        alert('Failed to load reservations. Please try again.');
    }

    function startTimer(duration, display) {
        var timer = duration, hours, minutes, seconds;

        // Set the animation duration dynamically
        document.querySelector('.square').style.setProperty('--animation-duration', `${duration}s`);

        var interval = setInterval(function () {
            hours = parseInt(timer / 3600, 10);
            minutes = parseInt((timer % 3600) / 60, 10);
            seconds = parseInt(timer % 60, 10);

            hours = hours < 10 ? "0" + hours : hours;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = hours + ":" + minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(interval); // Stop the timer

                display.textContent = nextReservationDate;
            }
        }, 1000);
    }

    function isToday(date) {
        const today = new Date();

        // Get the local date string for today (YYYY-MM-DD format)
        const todayString = today.toLocaleDateString('en-CA'); // 'en-CA' gives the ISO format (YYYY-MM-DD) in local time

        // Convert the input date to a local date string (assume input is in ISO format)
        const resDate = new Date(date);
        const resDateString = resDate.toLocaleDateString('en-CA');

        // Compare the local date string with today's local date string
        return resDateString === todayString;
    }

    function resetParkingDetails() {
        document.getElementById('parking-info').innerHTML = "Parking<br>-";
        document.getElementById('slot-info').innerHTML = "Slot<br>-";
        document.getElementById('start-time').innerHTML = "Start<br>-";
        document.getElementById('end-time').innerHTML = "End<br>-";
        startTimer(0, document.querySelector('#countdown-timer'));
        document.querySelector('.square').style.setProperty('--start-top', "100%");
    }

    // Load the next reservation and potentially update the timer
    loadNextReservation();

    // Modal handling

    function showPopup() {
        $('#blockedPopup').removeClass('hidden');
    }

    // Function to hide the popup
    function hidePopup() {
        $('#blockedPopup').addClass('hidden');
    }

    // Open the popup when the "I'm Blocked" button is clicked
    $('#openPopup').click(function () {
        showPopup();
    });

    // Close the popup when the close button or footer cancel button is clicked
    $('#closePopup, #closePopupFooter').click(function () {
        hidePopup();
    });

    // Handle the "Call Him" button click inside the popup
    $('#callOwnerPopup').click(function () {
        var carNumber = $('#blockerCarNumber').val();
        if (carNumber) {
            // Make the API call to get user details by car number
            ajaxCall("GET", `${apiBaseUrl}/Users/getByCarNumber/${encodeURIComponent(carNumber)}`, null, handleCarOwnerSuccess, handleCarOwnerError);
        } else {
            alert('Please enter a car number');
        }
    });

    function handleCarOwnerSuccess(response) {
        if (response && response.userPhone) {
            let phoneNumber = response.userPhone.replace(/-/g, ''); // Remove hyphens

            // Add country code '972' and remove the first digit (assuming phone starts with 0)
            if (phoneNumber.startsWith('0')) {
                phoneNumber = '972' + phoneNumber.slice(1);
            }

            // Open WhatsApp chat in a new window
            const whatsappUrl = `https://wa.me/${phoneNumber}`;
            window.open(whatsappUrl, '_blank');
            hidePopup();
        } else {
            alert("Could not retrieve the owner's phone number.");
        }
    }

    // Error handler for the API call
    function handleCarOwnerError(error) {
        console.error("Error fetching car owner details:", error);
        alert('Failed to retrieve car owner details. Please try again.');
    }


});
