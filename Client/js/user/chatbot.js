$(document).ready(function () {
    const apiBaseUrl = 'http://localhost:7157/api'; // Base URL for your API
    const userData = JSON.parse(sessionStorage.getItem('res')); // Retrieve user data from session storage

    // Check if user is logged in by checking userId
    if (!userData || !userData.userId) {
        displayMessage("Bot", "Please log in to submit reservations.");
        return; // Stop further execution if the user is not logged in
    }

    const userFirstName = userData ? userData.userFirstName : "User";

    // Display the first message from the bot
    displayMessage("Bot", "Hey, enter your request for reservations");

    $('#sendButton').click(function () {
        const messageInput = $('#messageInput').val().trim();
        if (messageInput === "") {
            alert("Please enter a request");
            return;
        }

        // Display user's message
        displayMessage("You", messageInput);

        // Send user's request to the API
        sendReservationRequest(messageInput);

        // Clear the input field
        $('#messageInput').val("");
    });

    function sendReservationRequest(userPrompt) {
        const data =
        {
            prompt: userPrompt
        };

        if (location.hostname == "localhost" || location.hostname == "127.0.0.1")
        {
            apiUrl = `${apiBaseUrl}/GPT/get-reservation-by-prompt`;
        }
        else
        {
            apiUrl = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/GPT/get-reservation-by-prompt";
        }

        // Make the API call using the external ajaxCall function
        ajaxCall("POST", apiUrl, JSON.stringify(data), handleApiResponse, handleApiError, "application/json");
    }

    function handleApiResponse(response) {
        if (response && response.dates && response.dates.length > 0) {
            // Inform the user about the reservations being submitted
            displayMessage("Bot", `Submitting ${response.dates.length} reservations...`);

            // Submit a reservation for each date in the response
            response.dates.forEach(function (dateObj) {
                const reservationData = {
                    reservationId: 0,
                    userId: userData.userId,  // Use userId from session storage
                    parkId: 1,  // Default value
                    reservation_Date: dateObj.date,
                    reservation_STime: dateObj.start,
                    reservation_ETime: dateObj.end,
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

                // Call the reservation API to submit the reservation
                ajaxCall("POST", apiUrl , JSON.stringify(reservationData), function (response) {
                    postReservationSuccess(response, reservationData); // Pass the reservation data for details
                }, postReservationError);
            });
        } else {
            displayMessage("Bot", "Please enter request of future reservations only.");
        }
    }

    function handleApiError(xhr, status, error) {
        displayMessage("Bot", "Sorry, something went wrong. Please try again.");
        console.error("API call failed:", status, error);
    }

    function postReservationSuccess(response, reservationData) {
        // Format date and time
        const formattedDate = formatDate(reservationData.reservation_Date);
        const formattedSTime = formatTime(reservationData.reservation_STime);
        const formattedETime = formatTime(reservationData.reservation_ETime);

        // Display the success message with reservation details
        const reservationDetails = `Reservation created successfully! Date: ${formattedDate} ${formattedSTime}-${formattedETime}`;
        displayMessage("Bot", reservationDetails);
    }

    function postReservationError(error) {
        displayMessage("Bot", "Failed to create reservation. Please try again.");
        console.error("Error creating reservation:", error);
    }

    function displayMessage(sender, content) {
        const messageElement = `<div><strong>${sender}</strong>: ${content.replace(/\n/g, '<br/>')}</div>`;
        $('#chat-messages').append(messageElement);
        $('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight); // Auto-scroll to the bottom
    }

    // Function to format the date from YYYY-MM-DD to DD-MM-YYYY
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = ("0" + date.getDate()).slice(-2);   // Add leading zero if needed
        const month = ("0" + (date.getMonth() + 1)).slice(-2);  // Add leading zero if needed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Function to format time from HH:MM:SS to HH:MM
    function formatTime(timeString) {
        return timeString.slice(0, 5); // Extract only the HH:MM part
    }
});
