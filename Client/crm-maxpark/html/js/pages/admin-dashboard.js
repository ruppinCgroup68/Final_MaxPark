
$(document).ready(function () {
    // Initialize dashboard functionalities on load
    initAdminDashboard();
});

function initAdminDashboard() {
    // Set API endpoint based on environment
    let api;
    if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        api = 'http://localhost:7061/api/Reservasions/readReservations';
    } else {
        api = 'https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Reservasions/readReservations';
    }

    // Fetch reservations data from the server
    ajaxCall('GET', api, null, handleSuccess, handleError);
    setupEventListeners();
}

// Navigation function
function loadContent(page) {
    window.location.href = page;
}

// Logout function
function logout() {
    sessionStorage.clear(); // Clears session storage
    localStorage.clear();   // Clears local storage (if used)
    window.location.href = '../../login.html'; // Redirects to login
}

function handleSuccess(response) {
    const data = response;

    // Format dates in DD-MM-YYYY format
    data.forEach(item => {
        item.reservation_Date = formatDate(item.reservation_Date);
    });

    // Generate a list of all dates in the specified range
    const allDates = generateDateRange('2024-09-01', '2024-10-28');

    // Generate first graph: Reservations by Date
    const datesCtx = document.getElementById('datesGraph').getContext('2d');
    const datesData = groupBy(data, 'reservation_Date');
    const datesLabels = Object.keys(datesData);
    const datesCounts = datesLabels.map(label => datesData[label].length);

    new Chart(datesCtx, {
        type: 'bar',
        data: {
            labels: datesLabels,
            datasets: [{
                label: 'Number of Reservations',
                data: datesCounts,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Generate third graph: Average Parking Time
    const avgParkingTimeCtx = document.getElementById('avgParkingTimeGraph').getContext('2d');
    const avgTimeData = calculateAverageParkingTime(data, allDates, datesData);
    new Chart(avgParkingTimeCtx, {
        type: 'line',
        data: {
            labels: Object.keys(avgTimeData),
            datasets: [{
                label: 'Average Parking Time (hours)',
                data: Object.values(avgTimeData),
                backgroundColor: '#FFCE56',
                fill: true,
                borderColor: '#FFCE56',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function handleError(error) {
    console.error('Failed to load reservations:', error);
    alert('Failed to load reservations. Please try again.');
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
}

function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
}

function calculateAverageParkingTime(data, allDates, datesData) {
    const avgTimeData = {};
    allDates.forEach(date => {
        avgTimeData[date] = 0; // Initialize with 0
    });
    data.forEach(item => {
        const date = item.reservation_Date;
        const startTime = new Date(`1970-01-01T${item.reservation_STime}`);
        const endTime = new Date(`1970-01-01T${item.reservation_ETime}`);
        const duration = (endTime - startTime) / (1000 * 60 * 60);
        if (avgTimeData[date] === 0) {
            avgTimeData[date] = duration;
        } else {
            avgTimeData[date] += duration;
        }
    });
    for (const date in avgTimeData) {
        const count = datesData[date] ? datesData[date].length : 0;
        avgTimeData[date] = count > 0 ? avgTimeData[date] / count : 0;
    }
    return avgTimeData;
}

function generateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];
    let currentDate = start;

    while (currentDate <= end) {
        dateArray.push(formatDate(currentDate.toISOString()));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}

function setupEventListeners() {
    // Reload data when refresh button is clicked
    $('#refreshButton').on('click', function () {
        loadDashboardData();
    });
}
