﻿$(document).ready(function () {
    // Define the base API endpoint
     const baseApi = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://localhost:7061/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    // Initialize the dashboard
    initDashboard(baseApi);

    const today = new Date().toISOString().split('T')[0];
    $('#dateFilter').val(today);
    $('#parkingDatePicker').val(today);

    $('#dateFilter').on('change', function () {
        const selectedDate = new Date(this.value);
        updateBarChart(selectedDate, baseApi);
    });

    $('#parkingDatePicker').on('change', function () {
        const selectedDate = this.value;
        renderParkingSlots(lastFetchedData, selectedDate); // Update parking slots based on selected date
    });
});

let lastFetchedData = []; // Store fetched data for reuse


function initDashboard(baseApi) {
    const api = `${baseApi}/Reservations/readReservations`;

    // Fetch reservations data from the server using ajaxCall
    ajaxCall('GET', api, null, function (response) {
        handleSuccess(response, baseApi);
        renderParkingSlots(response);
    }, handleError);
}

// Render distinct parking slots with selected date
function renderParkingSlots(data, selectedDate = new Date().toISOString().split('T')[0]) {
    const parkingSlotsList = $('#parkingSlotsList');

    // Get unique markIds (ignoring 0) and sort them
    const parkingSlots = [...new Set(data.map(item => item.markId))].filter(markId => markId !== 0).sort((a, b) => a - b);

    parkingSlotsList.empty(); // Clear existing list items

    parkingSlots.forEach(markId => {
        // Check if there are reservations for this markId on the selected date
        const hasReservation = data.some(item => {
            const reservationDate = new Date(item.reservation_Date).toISOString().split('T')[0];
            return item.markId === markId && reservationDate === selectedDate;
        });

        // Set button color based on reservation status
        const buttonColor = hasReservation ? 'btn-success' : 'btn-light';

        const button = $(`
            <button type="button" class="btn ${buttonColor} border p-3" style="width: 60px; height: 60px;" data-mark-id="${markId}">
                ${markId}
            </button>
        `);

        button.on('click', function () {
            displayReservationsForMark(markId, data, selectedDate);
        });

        parkingSlotsList.append(button);
    });
}

// Display reservations for the selected parking slot for a specific date
function displayReservationsForMark(markId, data, selectedDate) {
    const selectedReservations = data.filter(item => {
        const reservationDate = new Date(item.reservation_Date).toISOString().split('T')[0];
        return item.markId === markId && reservationDate === selectedDate;
    });

    const reservationList = selectedReservations.map(item => `
        <li>
            Reservation ID: ${item.reservationId}<br>
            Name: ${item.userFirstName} ${item.userLastName}<br>
            Start Time: ${item.reservation_STime}<br>
            End Time: ${item.reservation_ETime}<br>
        </li>
    `).join('');

    const message = reservationList || "<li>No reservations for this mark on the selected date.</li>";

    // Modal content
    const modalContent = `
        <div class="modal fade" id="reservationModal" tabindex="-1" role="dialog" aria-labelledby="reservationModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="reservationModalLabel">Reservations for Parking Slot ${markId}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul>${message}</ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append and show modal
    $('body').append(modalContent);
    $('#reservationModal').modal('show');
    $('#reservationModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

function handleSuccess(response, baseApi) {
    const today = new Date();
    updateBarChart(today, baseApi, response);

    // Prepare and render pie chart data for all-time approved vs. not approved
    const { approvedCount, notApprovedCount } = calculateOverallStatus(response);
    renderPieChart(approvedCount, notApprovedCount);
}

function handleError(error) {
    console.error('Failed to load reservations:', error);
    alert('Failed to load reservations. Please try again.');
}

// Calculate counts for approved and not approved reservations (all time)
function calculateOverallStatus(data) {
    let approvedCount = 0;
    let notApprovedCount = 0;

    data.forEach(item => {
        if (item.markId !== 0) {  // Approved
            approvedCount++;
        } else {  // Not Approved
            notApprovedCount++;
        }
    });

    return { approvedCount, notApprovedCount };
}

// Update the bar chart based on a selected date
function updateBarChart(selectedDate, baseApi, data = null) {
    if (!data) {
        // If no data is provided, reload it from the server
        const api = `${baseApi}/Reservations/readReservations`;
        ajaxCall('GET', api, null, function (response) {
            updateBarChart(selectedDate, baseApi, response);
        }, handleError);
        return;
    }

    const lastWeekData = filterDataByDateRange(data, selectedDate);
    const { labels, series } = prepareChartData(lastWeekData);
    renderBarChart(labels, series);
}

// Function to filter data for the last 7 days from the selected date
function filterDataByDateRange(data, endDate) {
    const labels = [];

    // Create the 7-day date labels in 'YYYY-MM-DD' format starting from endDate
    for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - i);
        labels.push(date.toISOString().split('T')[0]);
    }

    //// Filter data to include only dates within this 7-day range
    //const filteredData = data.filter(item => {
    //    const reservationDate = new Date(item.reservation_Date).toISOString().split('T')[0];
    //    return labels.includes(reservationDate);
    //});

    const filteredData = data.filter(item => {
        if (!item.reservation_Date) return false;
        const reservationDate = new Date(item.reservation_Date).toISOString().split('T')[0];
        return labels.includes(reservationDate);
    });


    return { filteredData, labels };
}

// Function to prepare data for the Chartist bar chart
function prepareChartData({ filteredData, labels }) {
    const approvedCounts = Array(7).fill(0);
    const notApprovedCounts = Array(7).fill(0);

    // Count reservations by approval status for each date
    filteredData.forEach(item => {
        const date = new Date(item.reservation_Date).toISOString().split('T')[0];
        const dayIndex = labels.indexOf(date);

        if (dayIndex !== -1) {
            if (item.markId !== 0) {  // Approved
                approvedCounts[dayIndex]++;
            } else {  // Not Approved
                notApprovedCounts[dayIndex]++;
            }
        }
    });

    return {
        labels,
        series: [approvedCounts, notApprovedCounts]
    };
}

// Render the Chartist bar chart with filtered data
function renderBarChart(labels, series) {
    new Chartist.Bar('#reservationStatusChart', {
        labels: labels,
        series: series
    }, {
        seriesBarDistance: 15,
        stackBars: false,
        axisX: {
            position: 'end',
            showGrid: false
        },
        axisY: {
            onlyInteger: true,
            offset: 30,
            labelInterpolationFnc: function (value) {
                return value;
            }
        },
        plugins: [
            Chartist.plugins.tooltip()
        ]
    }).on('draw', function (data) {
        if (data.type === 'bar') {
            if (data.seriesIndex === 0) {
                data.element.attr({ style: 'stroke: #4CAF50; stroke-width: 20px' }); // Green for Approved
            } else if (data.seriesIndex === 1) {
                data.element.attr({ style: 'stroke: #F44336; stroke-width: 20px' }); // Red for Not Approved
            }
        }
    });
}

// Render the Chart.js pie chart for all-time approved vs. not approved
function renderPieChart(approvedCount, notApprovedCount) {
    const ctx = document.getElementById('reservationStatusPieChart').getContext('2d');

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Approved', 'Not Approved'],
            datasets: [{
                data: [approvedCount, notApprovedCount],
                backgroundColor: ['#4CAF50', '#F44336'],
                hoverBackgroundColor: ['#66BB6A', '#EF5350']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const value = tooltipItem.raw;
                            return `${tooltipItem.label}: ${value}`;
                        }
                    }
                }
            }
        }
    });
}
