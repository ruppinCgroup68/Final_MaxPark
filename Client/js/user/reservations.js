$(document).ready(function () {

    let currentPage = 1;
    const rowsPerPage = 5;

    // Function to load reservations from the API
    function loadReservations() {
        let userData = JSON.parse(sessionStorage.getItem('res'));
        if (userData && userData.userId)
        {
            if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
                api = `http://localhost:7061/api/Users/reservationList?userId=${userData.userId}`;
            }
            else
            {
                api = `https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Users/reservationList?userId=${userData.userId}`;
            }
            
            ajaxCall("GET", api, null, postLoadReservationsSuccess, postLoadReservationsError);
        }
        else
        {
            console.error("User data not found in session storage.");
        }
    }

    function postLoadReservationsSuccess(response) {
        let reservations = response;

        let filterDate = $('#filterDate').val();
        let filterStatus = $('#filterStatus').val();

        // Filter reservations based on the selected date and status
        let filteredReservations = reservations.filter(function (reservation) {
            let date = formatDate(reservation.reservation_Date);
            let status = reservation.reservation_Status;

            let showRow = true;
            if (filterDate && filterDate !== date) {
                showRow = false;
            }
            if (filterStatus && filterStatus !== status) {
                showRow = false;
            }

            return showRow;
        });

        paginateReservations(filteredReservations);
    }

    function postLoadReservationsError(error) {
        console.error("Error loading reservations:", error);
        alert('Failed to load reservations. Please try again.');
    }

    function formatDate(dateString) {
        let date = new Date(dateString);
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    function formatTime(timeString) {
        return timeString.slice(0, 5); // Assumes timeString is in the format "HH:MM:SS"
    }

    function paginateReservations(reservations) {
        let tableBody = $('#reservation-table-body');
        tableBody.empty(); // Clear any existing rows

        let totalRows = reservations.length;
        let totalPages = Math.ceil(totalRows / rowsPerPage);

        let start = (currentPage - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let paginatedReservations = reservations.slice(start, end);

        paginatedReservations.forEach(function (reservation) {
            let date = formatDate(reservation.reservation_Date);
            let stime = formatTime(reservation.reservation_STime);
            let etime = formatTime(reservation.reservation_ETime);
            let status = reservation.reservation_Status;

            let statusClass = '';
            if (status === "הזמנה בהמתנה") {
                statusClass = 'waiting';
            } else if (status === "נדחה" || status === "בוטל") {
                statusClass = 'denied';
            } else if (status === "אישור") {
                statusClass = 'approved';
            }

            let row = `<tr>
                        <td>${date}</td>
                        <td>${stime}-${etime}</td>
                        <td class="status ${statusClass}">${status}</td>
                   </tr>`;
            tableBody.append(row);
        });

        // Update pagination controls
        $('#pageInfo').text(`Page ${currentPage} of ${totalPages}`);
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', currentPage === totalPages);
    }

    // Load reservations on page ready
    loadReservations();

    // Refresh table when date or status filter is changed
    $('#filterDate, #filterStatus').on('change', function () {
        currentPage = 1; // Reset to the first page
        loadReservations();
    });

    // Handle pagination buttons
    $('#prevPage').on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            loadReservations();
        }
    });

    $('#nextPage').on('click', function () {
        currentPage++;
        loadReservations();
    });

});
