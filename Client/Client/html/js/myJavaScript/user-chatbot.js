$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" ? "https://localhost:7061/api" : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";
    const userData = JSON.parse(sessionStorage.getItem('res'));

    if (!userData || !userData.userId) {
        displayMessage("Bot", "Please log in to submit events.");
        return;
    }

    displayMessage("Bot", "Hey, enter your request for events");

    $('#sendButton').click(function () {
        const messageInput = $('#messageInput').val().trim();
        if (messageInput === "") {
            alert("Please enter a request");
            return;
        }
        displayMessage("You", messageInput);
        sendeventRequest(messageInput);
        $('#messageInput').val("");
    });

    function sendeventRequest(userPrompt) {
        const data = { prompt: userPrompt };
        const apiUrl = `${apiBaseUrl}/GPT/get-event-by-prompt`;

        ajaxCall("POST", apiUrl, JSON.stringify(data), handleApiResponse, handleApiError, "application/json");
    }

    function handleApiResponse(response) {
        if (response && response.dates && response.dates.length > 0) {
            displayMessage("Bot", `Submitting ${response.dates.length} events...`);
            response.dates.forEach(submitevent);
        } else {
            displayMessage("Bot", "Please enter request of future events only.");
        }
    }

    function handleApiError() {
        displayMessage("Bot", "Please enter request of future events only.");
    }

    function submitevent(dateObj) {
        const eventData = {
            eventId: 0,
            userId: userData.userId,
            parkId: 1,
            event_Date: dateObj.date,
            event_STime: dateObj.start,
            event_ETime: dateObj.end,
            event_Status: "Pending",
            markId: 0
        };
        const apiUrl = `${apiBaseUrl}/events/newevent`;
        console.log(eventData);
        ajaxCall("POST", apiUrl, JSON.stringify(eventData), function () {
            postSuccess(eventData);
        }, posteventError);
    }

    function posteventSuccess(eventData) {
        const formattedDate = formatDate(eventData.event_Date);
        const formattedSTime = formatTime(eventData.event_STime);
        const formattedETime = formatTime(eventData.event_ETime);
        displayMessage("Bot", `event created successfully! Date: ${formattedDate} ${formattedSTime}-${formattedETime}`);
    }

    function posteventError() {
        displayMessage("Bot", "Failed to create event. Please try again.");
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
