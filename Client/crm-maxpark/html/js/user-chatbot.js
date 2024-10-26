$(document).ready(function () {
    //const apiBaseUrl = location.hostname === "localhost" ? "http://localhost:7061/api" : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const apiBaseUrl = location.hostname === "localhost" ? "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api" : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const userData = JSON.parse(sessionStorage.getItem('res'));

    if (!userData || !userData.userId) {
        displayMessage("Bot", "Please log in to submit reservations.");
        return;
    }

    displayMessage("Bot", "Hey, enter your request for reservations");

    $('#sendButton').click(function () {
        const messageInput = $('#messageInput').val().trim();
        if (messageInput === "") {
            alert("Please enter a request");
            return;
        }
        displayMessage("You", messageInput);
        sendReservationRequest(messageInput);
        $('#messageInput').val("");
    });

    function sendReservationRequest(userPrompt) {
        const data = { prompt: userPrompt };
        const apiUrl = `${apiBaseUrl}/GPT/get-reservation-by-prompt`;

        ajaxCall("POST", apiUrl, JSON.stringify(data), handleApiResponse, handleApiError, "application/json");
    }

    function handleApiResponse(response) {
        if (response && response.dates && response.dates.length > 0) {
            displayMessage("Bot", `Submitting ${response.dates.length} reservations...`);
            response.dates.forEach(submitReservation);
        } else {
            displayMessage("Bot", "Please enter request of future reservations only.");
        }
    }

    function handleApiError() {
        displayMessage("Bot", "Sorry, something went wrong. Please try again.");
    }

    function submitReservation(dateObj) {
        const reservationData = {
            reservationId: 0,
            userId: userData.userId,
            parkId: 1,
            reservation_Date: dateObj.date,
            reservation_STime: dateObj.start,
            reservation_ETime: dateObj.end,
            reservation_Status: "Pending",
            markId: 0
        };
        const apiUrl = `${apiBaseUrl}/Reservasions/newReservation`;
        ajaxCall("POST", apiUrl, JSON.stringify(reservationData), function () {
            postReservationSuccess(reservationData);
        }, postReservationError);
    }

    function postReservationSuccess(reservationData) {
        const formattedDate = formatDate(reservationData.reservation_Date);
        const formattedSTime = formatTime(reservationData.reservation_STime);
        const formattedETime = formatTime(reservationData.reservation_ETime);
        displayMessage("Bot", `Reservation created successfully! Date: ${formattedDate} ${formattedSTime}-${formattedETime}`);
    }

    function postReservationError() {
        displayMessage("Bot", "Failed to create reservation. Please try again.");
    }

    function displayMessage(sender, content) {
        const messageElement = `<div class="${sender === "Bot" ? "bot-message" : "user-message"}">
        <strong>${sender}:</strong> ${content}
    </div>`;
        $('#chatMessages').append(messageElement);
        $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    }

    function formatTime(timeString) {
        return timeString.slice(0, 5);
    }
});
