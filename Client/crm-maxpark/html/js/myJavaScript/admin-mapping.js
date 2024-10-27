$(document).ready(function () {
    fetchParkingData();
});

let slotsArray = [];
let dataRetrieved = [];
let lastSlotId = 1;
const server = "http://localhost:7061/api";
function fetchParkingData() {
    if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        api = server + '/Marks';
    }
    else {
        api = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Marks";
    }

    ajaxCall('GET', api, null, onFetchSuccess, onFetchError);
}

function onFetchSuccess(data) {
    if (Array.isArray(data) && data.length > 0) {
        const totalSlots = data.length;
        dataRetrieved = data;
        initializeParkingTable(data, totalSlots);
    } else {
        alert("No parking data found.");
    }
}

function onFetchError(xhr, status, error) {
    alert("Failed to retrieve parking slots data.");
    console.error("Error fetching data:", error);
}

function initializeParkingTable(slotsData, totalSlots) {
    const parkingContainer = $('#parking-container');
    parkingContainer.empty(); // Clear previous entries
    slotsArray = []; // Reset the array for fresh initialization
    let modalContent = '<div class="flex-container">';

    slotsData.forEach((slot, index) => {
        lastSlotId = lastSlotId + 1;
        // Skip slots with names ending in 'b'
        if (slot.markName.endsWith('b')) {
            return;
        }

        const slotId = index + 1;
        slotsArray.push(slot.markName);

        // Determine if this slot is blocked
        const isBlocked = slot.markName_Block !== '-';

        // Generate the HTML for the slot
        if (isBlocked) {
            modalContent +=
                `<div id="slot${slotId}" class="slot blocked">
                    <div class="slot">
                        <div class="slot-details-blocked">${slot.markName}</div>
                        <div class="slot-details">
                            ${slot.markName_Block}
                            <button class="unblock-button" onclick="unsplitSlot(${slotId})">Unblock</button>
                        </div>
                    </div>
                </div>`;
        } else {
            modalContent +=
                `<div id="slot${slotId}" class="slot">
                    <span>${slot.markName}</span>
                    <div class="slot-details"></div>
                    <button class="block-button" onclick="splitSlot(${slotId})">Block</button>
                </div>`;
        }

        if (slotsArray.length % 5 === 0) {
            modalContent += '<div class="row-break"></div>'; //Ensures that rows break correctly
        }
    });

    modalContent += '</div>';
    parkingContainer.html(modalContent);
}

function splitSlot(slotId) {
    const slot = document.getElementById(`slot${slotId}`);
    const slotName = dataRetrieved[slotId - 1].markName; // Use slotsArray to determine the slot name

    // Add the blocked slot to dataRetrieved
    const blockedSlot = {
        markId: lastSlotId + 1, // Generate a new ID for the blocked slot
        parkId: 1, // Assuming parkId is 1 as per the dropdown
        markName: `${slotName}b`,
        markName_Block: '-', // Set the block relation to the main slot
        isAvailable: true
    };

    // Update the main slot's markName_Block to indicate it's blocking the "b" part
    const mainSlotIndex = dataRetrieved.findIndex(item => item.markName === slotName);
    if (mainSlotIndex !== -1) {
        dataRetrieved[mainSlotIndex].markName_Block = `${slotName}b`;
    } else {
        console.error(`Main slot ${slotName} not found in dataRetrieved.`);
        return;
    }

    // Add the blocked slot to dataRetrieved
    dataRetrieved.push(blockedSlot);
    lastSlotId = blockedSlot.markId; // Update the lastSlotId to the newly created blocked slot's ID

    slot.classList.add('blocked');
    slot.innerHTML =
        `<div class="slot">
            <div class="slot-details-blocked">${slotName}</div>
            <div class="slot-details">
                ${slotName}b
                <button class="unblock-button" onclick="unsplitSlot(${slotId})">Unblock</button>
            </div>
        </div>`;
}

function unsplitSlot(slotId) {
    const slot = document.getElementById(`slot${slotId}`);
    const slotName = dataRetrieved[slotId - 1].markName; // Use slotsArray to determine the slot name

    // Remove the blocked slot from dataRetrieved
    const indexToRemove = dataRetrieved.findIndex(item => item.markName === `${slotName}b`);
    if (indexToRemove !== -1) {
        dataRetrieved.splice(indexToRemove, 1);
    }

    // Reset the main slot's markName_Block to indicate it's no longer blocking
    const mainSlotIndex = dataRetrieved.findIndex(item => item.markName === slotName);
    if (mainSlotIndex !== -1) {
        dataRetrieved[mainSlotIndex].markName_Block = '-';
    }

    slot.classList.remove('blocked');
    slot.innerHTML =
        `<span>${slotName}</span>
        <div class="slot-details"></div>
        <button class="block-button" onclick="splitSlot(${slotId})">Block</button>`;
}
function addSlotAlert() {
    // Determine the new slot ID and markName
    const newSlotId = dataRetrieved.length + 1;
    const newMarkName = `P${newSlotId}`;

    // Add the new slot to the slotsData array
    dataRetrieved.push({
        markId: newSlotId,
        parkId: 1, // Assuming parkId is 1 as per the dropdown
        markName: newMarkName,
        markName_Block: "-",
        isAvailable: true
    });

    // Reinitialize the parking table with the updated slotsData
    initializeParkingTable(dataRetrieved, dataRetrieved.length);
}

// Save Parking Changes
function saveParkingChanges() {
    //deleteParking();
    deleteAndSaveParking();
}

function deleteParkingChanges() {
    deleteParking();
}

function deleteParking() {

    if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        api = server + '/admin/deleteParkingMarks';
    }
    else {
        api = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/deleteParkingMarks";
    }

    function onSuccess(response) {
        alert('Deleted');
    }

    function onError(xhr, status, error) {
        if (xhr.status === 200) {
            // The status code is 200, but the error callback was triggered, so call the success handler
            alert('Deleted');
        } else {
            // Handle other errors normally
            console.error('Failed to deleteParking', status, error);
            alert('An error occurred while deleteParking. Please try again.');
        }
    }

    ajaxCall('DELETE', api, null, onSuccess, onError);
}

function deleteAndSaveParking() {

    if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        api = server + '/admin/deleteParkingMarks';
    }
    else {
        api = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/deleteParkingMarks";
    }

    function onSuccess(response) {
        addParking();
    }

    function onError(xhr, status, error) {
        if (xhr.status === 200) {
            // The status code is 200, but the error callback was triggered, so call the success handler
            addParking();
        } else {
            // Handle other errors normally
            console.error('Failed to deleteParking', status, error);
            alert('An error occurred while deleting parking. Please try again.');
        }
    }

    ajaxCall('DELETE', api, null, onSuccess, onError);
}


function addParking() {
    if (location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        api = server + '/admin/AddMark';
    }
    else {
        api = "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api/Admin/addMark";
    }

    const parkingData = generateParkingData();

    function onAddSuccess() {
        alert("Parking slots added successfully.");
        fetchParkingData(); // Refresh the parking data after successful addition
    }

    function onAddError(xhr, status, error) {
        alert("Failed to add parking slots.");
        console.error("Error adding parking slots:", error);
    }

    ajaxCall('POST', api, JSON.stringify(parkingData), onAddSuccess, onAddError);
}




function generateParkingData() {
    if (!Array.isArray(dataRetrieved)) {
        console.error("dataRetrieved is not an array. Please check the input.");
        return [];
    }

    // Sort dataRetrieved by markName using a custom sorting function to handle alphanumeric sorting
    dataRetrieved.sort((a, b) => {
        const markNameA = a.markName.match(/(\D+)(\d*)/);  // Match letters and numbers
        const markNameB = b.markName.match(/(\D+)(\d*)/);

        // Compare the letter part first
        if (markNameA[1] < markNameB[1]) return -1;
        if (markNameA[1] > markNameB[1]) return 1;

        // Compare the numeric part, if available (handle missing or empty numeric parts as 0)
        const numA = parseInt(markNameA[2] || "0", 10);
        const numB = parseInt(markNameB[2] || "0", 10);
        return numA - numB;
    });

    // Reassign markId based on the new sorted order
    dataRetrieved.forEach((item, index) => {
        if (!item.hasOwnProperty('markName')) {
            console.error(`Item at index ${index} is missing the 'markName' property. Skipping this item.`);
        } else {
            item.markId = index + 1; // Assign new markId starting from 1
        }
    });

    return dataRetrieved;
}

function loadContent(page) {
    window.location.href = page;
}

function logout() {
    // Clear session storage or any authentication tokens
    sessionStorage.clear(); // Clears all session storage
    localStorage.clear();   // Clears all local storage (if you use it)

    // Redirect to the login page
    window.location.href = '../../login.html';
}
