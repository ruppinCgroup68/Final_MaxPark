$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? 'https://localhost:7061/api'
        : 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api';

    const debug = false;

    function loadActiveParking() {
        if (debug) {
            simulateActiveParking();
        } else {
            const userData = JSON.parse(sessionStorage.getItem('res'));
            if (userData && userData.userId) {
                const api = `${apiBaseUrl}/Users/reservationList?userId=${userData.userId}`;
                ajaxCall("GET", api, null, handleActiveParkingSuccess, handleParkingError);
            } else {
                console.error("User data not found in session storage.");
            }
        }
    }

    function simulateActiveParking() {
        const simulatedReservation = {
            parkId: Math.floor(Math.random() * 100) + 1,
            markId: Math.floor(Math.random() * 50) + 1,
            reservation_STime: "09:00:00",
            reservation_ETime: "17:00:00",
            reservation_Date: new Date().toISOString().split('T')[0],
            reservation_Status: "אישור"
        };

        updateParkingDetails(simulatedReservation);
        startCountdown(simulatedReservation.reservation_Date, simulatedReservation.reservation_ETime);
        manageButtonAvailability(simulatedReservation.reservation_STime, simulatedReservation.reservation_ETime);
    }

    function handleActiveParkingSuccess(response) {
        const activeReservation = response.find(reservation => {
            const currentDate = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

            const isToday = reservation.reservation_Date.startsWith(currentDate);
            const startTime = reservation.reservation_STime;
            const endTime = reservation.reservation_ETime;

            return reservation.reservation_Status === "אישור" &&
                (isToday && (currentTime >= startTime && currentTime <= endTime));
        });

        if (activeReservation) {
            updateParkingDetails(activeReservation);
            startCountdown(activeReservation.reservation_Date, activeReservation.reservation_ETime);
            manageButtonAvailability(activeReservation.reservation_STime, activeReservation.reservation_ETime);
        } else {
            $('#active-parking-details').html('<p>No active parking reservation found.</p>');
        }
    }

    function updateParkingDetails(reservation) {
        const html = `
        <div class="mb-3">
            <label>Parking</label>
            <input type="text" class="form-control" value="${reservation.parkId}" readonly>
        </div>
        <div class="mb-3">
            <label>Slot</label>
            <input type="text" class="form-control" value="${reservation.markId}" readonly>
        </div>
        <div class="mb-3">
            <label>Start Time</label>
            <input type="text" class="form-control" value="${formatTime(reservation.reservation_STime)}" readonly>
        </div>
        <div class="mb-3">
            <label>End Time</label>
            <input type="text" class="form-control" value="${formatTime(reservation.reservation_ETime)}" readonly>
        </div>
        <div class="mb-3">
            <label>Status</label>
            <input type="text" class="form-control" value="${reservation.reservation_Status}" readonly>
        </div>
    `;

        $('#active-parking-details').html(html);
    }

    function formatTime(timeString) {
        return timeString.slice(0, 5);
    }

    function startCountdown(date, endTime) {
        const dateOnly = date.split('T')[0];
        const endDateTime = new Date(`${dateOnly}T${endTime}`);
        const timerInterval = setInterval(() => {
            const now = new Date();
            const timeRemaining = endDateTime - now;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                $('#countdown-timer').text("00:00:00");
                disableButton("#endParkingButton"); // שורה מבוטלת
                disableButton("#blockMeButton");
            } else {
                const hours = String(Math.floor(timeRemaining / 3600000)).padStart(2, '0');
                const minutes = String(Math.floor((timeRemaining % 3600000) / 60000)).padStart(2, '0');
                const seconds = String(Math.floor((timeRemaining % 60000) / 1000)).padStart(2, '0');
                $('#countdown-timer').text(`${hours}:${minutes}:${seconds}`);
            }
        }, 1000);
    }

    function combineDateAndTime(dateString, timeString) {
        return `${dateString}T${timeString}`;
    }

    function handleParkingError(error) {
        console.error("Error loading active parking:", error);
        alert('Failed to load active parking. Please try again.');
    }

    /*
    // Success and Error handlers for "סיום חניה" (End Parking)
    function endParkingSuccess() {
        alert('עדכון חניה בוצע בהצלחה.');
        disableButton("#endParkingButton"); 
        disableButton("#blockMeButton"); 
    }

    function endParkingError(error) {
        console.error('Error updating parking availability:', error);
        alert('שגיאה בעדכון זמינות חניה.');
    }

    // קריאת "סיום חניה" - עדכון זמינות בבסיס הנתונים
    $('#endParkingButton').on('click', function () {
        const markId = 1;

        const api = `${apiBaseUrl}/updateMarkAvailability`;
        const data = JSON.stringify({ markId, isAvailable: 1 });

        ajaxCall("POST", api, data, endParkingSuccess, endParkingError);
    });
    */

    loadActiveParking();
});
