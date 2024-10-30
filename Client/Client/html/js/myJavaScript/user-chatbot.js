$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" ? "https://localhost:7061/api" : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
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
        displayMessage("Bot", "Please enter request of future reservations only.");
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
        const apiUrl = `${apiBaseUrl}/Reservations/newReservation`;
        console.log(reservationData);
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


    $(document).on('click', '#chatBotIcon', function () {
        console.log("Chat bot icon clicked (event delegation)");
        $('#chat-container').toggle();
    });

    // Close chat container when clicking outside of it
    $(document).click(function (e) {
        if (!$(e.target).closest('#chat-container, #chatBotIcon').length) {
            $('#chat-container').hide();
        }
    });

    // Add a send message action
    $('#sendButton').click(function () {
        const message = $('#messageInput').val().trim();
        if (message) {
            $('#chatMessages').append(`<div><strong>You:</strong> ${message}</div>`);
            $('#messageInput').val(''); // Clear the input field
            // Here you could also send the message to the bot backend or handle it further
        }
    });

    // Optional: Submit on Enter key in the input field
    $('#messageInput').keypress(function (e) {
        if (e.which === 13) {
            $('#sendButton').click();
        }
    });

});
