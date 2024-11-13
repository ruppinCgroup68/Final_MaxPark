$(document).ready(function () {
    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://localhost:7061/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";


    let currentPage = 1;
    const rowsPerPage = 10;

    // Status color mapping
    const statusColors = {
        "הזמנה בהמתנה": "#FFA500",
        "דחייה": "red",
        "אישור": "green"
    };

    // Set default start and end dates
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(today.getFullYear() + 1);

    $('#filterStartDate').val(today.toISOString().split('T')[0]);
    $('#filterEndDate').val(oneYearLater.toISOString().split('T')[0]);

    // Load reservations from the API
    function loadReservations() {
        const userData = JSON.parse(sessionStorage.getItem('res'));
        if (userData && userData.userId) {
            const api = `${apiBaseUrl}/Users/reservationList?userId=${userData.userId}`;
            ajaxCall("GET", api, null, (response) => {
                reservationsData = response;
                sortReservationsByDate(); // Sort data by date before filtering
                applyFilters(); // Apply filters initially
            }, postLoadReservationsError);
        } else {
            console.error("User data not found in session storage.");
        }
    }

    // Sort reservations by reservation date (ascending)
    function sortReservationsByDate() {
        reservationsData.sort((a, b) => new Date(a.reservation_Date) - new Date(b.reservation_Date));
    }

    function postLoadReservationsSuccess(response) {
        const filterDate = $('#filterDate').val();
        const filterStatus = $('#filterStatus').val();

        // Filter reservations based on the selected date and status
        const filteredReservations = response.filter(reservation => {
            const date = formatDate(reservation.reservation_Date);
            const status = reservation.reservation_Status;

            return (!filterDate || filterDate === date) && (!filterStatus || filterStatus === status);
        });

        paginateReservations(filteredReservations);
    }

    function postLoadReservationsError(error) {
        console.error("Error loading reservations:", error);
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

            // Conditionally display the delete button only for status "הזמנה בהמתנה"
            const deleteButton = reservation.reservation_Status === "הזמנה בהמתנה"
                ? `<button class="btn btn-red btn-xs edit-btn">🗑️</button>`
                : "";

            const row = `
                <tr data-reservation-id="${reservation.reservationId}">
                    <td>${reservation.reservationId}</td>
                    <td>${formatDate(reservation.reservation_Date)}</td>
                    <td>${formatTime(reservation.reservation_STime)}</td>
                    <td>${formatTime(reservation.reservation_ETime)}</td>
                    <td style="color: ${statusColor}">${reservation.reservation_Status}</td>
                    <td>${reservation.markId}</td>
                    <td>${deleteButton}</td>
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


    // Event listener for delete button in the reservation table
    $(document).on('click', '.edit-btn', function () {
        const reservationId = $(this).closest('tr').data('reservation-id');
        if (confirm("Are you sure you want to delete this reservation?")) {
            const deleteApiUrl = `${apiBaseUrl}/Reservations/reservationId?reservationId=${reservationId}`;
            ajaxCall("DELETE", deleteApiUrl, null, deleteSuccess, deleteError);
        }
    });

    // Success callback for delete
    function deleteSuccess() {
        alert('Reservation deleted successfully');
        loadReservations(); // Reload reservations after deletion
    }

    // Error callback for delete
    function deleteError(xhr, status, error) {
        if (xhr.status === 200) {
            // If status is 200, treat it as a success and call deleteSuccess
            deleteSuccess();
        } else {
            // Otherwise, log the error and alert the user
            console.error("Error deleting reservation:", error);
            alert('Failed to delete reservation. Please try again.');
        }
    }
});
