$(document).ready(function () {
    //const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    //    ? "http://localhost:7061/api"
    //    : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";


    let currentPage = 1;
    const rowsPerPage = 5;

    // Status color mapping
    const statusColors = {
        "הזמנה בהמתנה": "#FFA500",
        "דחייה": "red",
        "אישור": "green"
    };

    // Function to load reservations from the API
    function loadReservations() {
        const userData = JSON.parse(sessionStorage.getItem('res'));
        if (userData && userData.userId) {
            const api = `${apiBaseUrl}/Users/reservationList?userId=${userData.userId}`;
            ajaxCall("GET", api, null, postLoadReservationsSuccess, postLoadReservationsError);
        } else {
            console.error("User data not found in session storage.");
        }
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

    function paginateReservations(reservations) {
        const totalPages = Math.ceil(reservations.length / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage;
        const paginatedReservations = reservations.slice(startIndex, startIndex + rowsPerPage);

        displayReservations(paginatedReservations);

        // Enable or disable pagination buttons based on current page
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

    // Pagination button event handlers
    $('#prevPageBtn').on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            loadReservations();
        }
    });

    $('#nextPageBtn').on('click', function () {
        currentPage++;
        loadReservations();
    });

    // Load reservations on page ready
    loadReservations();

    // Refresh table when date or status filter is changed
    $('#filterDate, #filterStatus').on('change', function () {
        currentPage = 1; // Reset to the first page
        loadReservations();
    });
});
