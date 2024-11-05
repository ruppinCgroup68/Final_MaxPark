$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://localhost:7061/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    let currentPage = 1;
    const rowsPerPage = 8;
    let eventsData = [];

    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7); // Set to 7 days before today

    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(today.getFullYear() + 1);

    $('#filterStartDate').val(oneWeekAgo.toISOString().split('T')[0]);
    $('#filterEndDate').val(oneYearLater.toISOString().split('T')[0]);

    // Function to load events
    function loadEvents() {
        const api = `${apiBaseUrl}/Events`;
        ajaxCall("GET", api, null, onLoadEventsSuccess, onLoadEventsError);
    }

    function onLoadEventsSuccess(response) {
        eventsData = response;
        applyFilters();
    }

    function onLoadEventsError(error) {
        console.error("Error loading events:", error);
        alert('Failed to load events. Please try again.');
    }

    function applyFilters() {
        const filterParkId = $('#filterParkId').val();
        const filterStartDate = $('#filterStartDate').val();
        const filterEndDate = $('#filterEndDate').val();

        const filteredEvents = eventsData.filter(event => {
            const eventDate = formatDate(event.event_Date);
            const parkIdMatches = !filterParkId || event.parkId == filterParkId;
            const dateInRange = (!filterStartDate || eventDate >= filterStartDate) &&
                (!filterEndDate || eventDate <= filterEndDate);

            return parkIdMatches && dateInRange;
        });

        paginateEvents(filteredEvents);
    }

    function paginateEvents(events) {
        const totalPages = Math.ceil(events.length / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage;
        const paginatedEvents = events.slice(startIndex, startIndex + rowsPerPage);

        displayEvents(paginatedEvents);

        $('#prevPageBtn').prop('disabled', currentPage === 1);
        $('#nextPageBtn').prop('disabled', currentPage === totalPages || events.length <= rowsPerPage);
    }

    function displayEvents(events) {
        const tableBody = $('#eventsTableBody');
        tableBody.empty();

        events.forEach(event => {
            const row = `
                <tr>
                    <td>${event.eventId}</td>
                    <td>${event.userId}</td>
                    <td>${event.parkId}</td>
                    <td>${event.markId}</td>
                    <td>${formatDate(event.event_Date)}</td>
                    <td>${formatTime(event.event_STime)}</td>
                    <td>${formatTime(event.event_ETime)}</td>
                    <td>${event.evenType}</td>
                    <td>${event.event_Note}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    function formatTime(timeString) {
        return timeString ? timeString.slice(0, 5) : '';
    }

    $('#prevPageBtn').on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
        }
    });

    $('#nextPageBtn').on('click', function () {
        currentPage++;
        applyFilters();
    });

    $('#filterParkId, #filterStartDate, #filterEndDate').on('change', function () {
        currentPage = 1;
        applyFilters();
    });

    // Show the Add Event modal
    $('#addEvents-btn').click(function () {
        console.log("Add Event button clicked");
        $('#addUserModal').fadeIn();  // Updated to use 'addUserModal'
    });

    // Close modal on cancel or close button click
    $('#closeModal, #cancel-btn').click(function () {
        console.log("Closing modal");
        $('#addUserModal').fadeOut();  // Updated to use 'addUserModal'
    });

    $('#add_EventForm').submit(function (e) {
        e.preventDefault();

        const carNumber = $('#carNumber').val();

        const newEvent = {
            eventId: 0,
            userId: 6, // Example user ID, replace as needed
            parkId: $('#parkId').val(),
            markId: $('#markId').val(),
            event_Date: $('#event_Date').val(),
            event_STime: $('#event_STime').val(),
            event_ETime: $('#event_ETime').val(),
            evenType: $('#evenType').val(),
            event_Note: $('#event_Note').val()
        };

        const api = `${apiBaseUrl}/Events/event/${carNumber}`;

        ajaxCall("POST", api, JSON.stringify(newEvent), onAddEventSuccess, onAddEventError);
    });

    function onAddEventSuccess(response) {
        alert("Event added successfully!");
        $('#addUserModal').fadeOut();  // Updated to use 'addUserModal'
        $('#add_EventForm')[0].reset();
        loadEvents();
    }

    function onAddEventError(error) {
        console.error("Failed to add event:", error);
        alert("Failed to add event. Please try again.");
    }

    loadEvents();
});
