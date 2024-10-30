$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://localhost:7061/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";


    let currentPage = 1;
    const rowsPerPage = 10;

    // status color 
    //const statusColors = {
    //    "הזמנה בהמתנה": "#FFA500",
    //    "דחייה": "red",
    //    "אישור": "green"
    //};

    // Set default start and end dates
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(today.getFullYear() + 1);

    $('#filterStartDate').val(today.toISOString().split('T')[0]);
    $('#filterEndDate').val(oneYearLater.toISOString().split('T')[0]);

    // Load Events from the API
    function loadReservations() {
        const eventData = JSON.parse(sessionStorage.getItem('eve'));
        if (eventData && eventData.eventId) {
            const api = `${apiBaseUrl}/Events/eventList?eventId=${userData.userId}`;
            ajaxCall("GET", api, null, (response) => {
                eventsData = response;
                sortEventsByDate(); // Sort data by date before filtering
                applyFilters(); // Apply filters initially
            }, postLoadEventsError);
        } else {
            console.error("Events data not found in session storage.");
        }
    }

    // Sort reservations by reservation date (ascending)
    function sortEventsByDate() {
        eventsData.sort((a, b) => new Date(a.events_Date) - new Date(b.events_Date));
    }

    function postLoadEventsSuccess(response) {
        const filterDate = $('#filterDate').val();
        const filterType = $('#filterType').val();

        // Filter events based on the selected date and types
        const filteredEvents = response.filter(event => {
            const date = formatDate(event.event_Date);
            const type = event.evenType;

            return (!filterDate || filterDate === date) && (!filterEvents || filterStatus === event);
        });

        paginateReservations(filteredEvents);
    }

    function postLoadEventsError(error) {
        console.error("Error loading s:", error);
        alert('Failed to load reservations. Please try again.');
    }

    function applyFilters() {
        const filterDateStart = $('#filterStartDate').val();
        const filterDateEnd = $('#filterEndDate').val();
        const filterStatus = $('#filterStatus').val();

        const filteredReservations = reservationsData.filter(reservation => {
            const reservationDate = formatDate(reservation.reservation_Date);
            const status = reservation.reservation_Status;

            // Filter by status
            const statusMatches = !filterStatus || filterStatus === status;

            // Filter by date range
            const dateInRange = (!filterDateStart || reservationDate >= filterDateStart) &&
                (!filterDateEnd || reservationDate <= filterDateEnd);

            return statusMatches && dateInRange;
        });

        paginateReservations(filteredReservations);
    }

    function paginateReservations(reservations) {
        const totalPages = Math.ceil(reservations.length / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage;
        const paginatedReservations = reservations.slice(startIndex, startIndex + rowsPerPage);

        displayReservations(paginatedReservations);

        // Enable or disable pagination buttons based on the current page and total filtered results
        $('#prevPageBtn').prop('disabled', currentPage === 1);
        $('#nextPageBtn').prop('disabled', currentPage === totalPages || reservations.length <= rowsPerPage);
    }

    function displayReservations(reservations) {
        const tableBody = $('#reservationTableBody');
        tableBody.empty();

        reservations.forEach(reservation => {
            const statusColor = statusColors[reservation.reservation_Status] || "black";
            const row = `
                <tr>
                    <td>${reservation.reservationId}</td>
                    <td>${formatDate(reservation.reservation_Date)}</td>
                    <td>${formatTime(reservation.reservation_STime)}</td>
                    <td>${formatTime(reservation.reservation_ETime)}</td>
                    <td style="color: ${statusColor}">${reservation.reservation_Status}</td>
                    <td>${reservation.markId}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    function formatTime(timeString) {
        return timeString.slice(0, 5); // Assumes timeString is in the format "HH:MM:SS"
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

    // Load reservations on page ready
    loadReservations();

    // Apply filters when any filter input changes
    $('#filterStartDate, #filterEndDate, #filterStatus').on('change', function () {
        currentPage = 1; // Reset to the first page
        applyFilters();
    });

    // Refresh table when date or status filter is changed
    $('#filterDate, #filterStatus').on('change', function () {
        currentPage = 1; // Reset to the first page
        loadReservations();
    });
});
