$(document).ready(function () {
    //const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    //    ? "http://localhost:7061/api"
    //    : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    const apiBaseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api"
        : "https://proj.ruppin.ac.il/cgroup68/test2/tar1/api";

    let slotsArray = [];
    let dataRetrieved = [];
    let lastSlotId = 1;

    // Load initial parking data
    fetchParkingData();

    function fetchParkingData() {
        const api = `${apiBaseUrl}/Marks`;
        ajaxCall('GET', api, null, onFetchSuccess, onFetchError);
    }

    function onFetchSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
            dataRetrieved = data;
            initializeParkingTable(data);
        } else {
            alert("No parking data found.");
        }
    }

    function onFetchError(xhr, status, error) {
        alert("Failed to retrieve parking slots data.");
        console.error("Error fetching data:", error);
    }

    function initializeParkingTable(slotsData) {
        const parkingContainer = $('#parking-container');
        parkingContainer.empty();
        slotsArray = [];

        slotsData.forEach((slot, index) => {
            lastSlotId++;
            if (slot.markName.endsWith('b')) return;

            const slotId = index + 1;
            slotsArray.push(slot.markName);
            const isBlocked = slot.markName_Block !== '-';
            const slotHTML = isBlocked
                ? `<div id="slot${slotId}" class="slot blocked">
                        <div class="slot-details-blocked">${slot.markName}</div>
                        <div class="slot-details">
                            ${slot.markName_Block}
                            <button class="unblock-button" data-slot-id="${slotId}">Unblock</button>
                        </div>
                   </div>`
                : `<div id="slot${slotId}" class="slot">
                        <span>${slot.markName}</span>
                        <div class="slot-details"></div>
                        <button class="block-button" data-slot-id="${slotId}">Block</button>
                   </div>`;

            parkingContainer.append(slotHTML);
        });

        // Attach click events for block/unblock buttons after the table is rendered
        $('.block-button').click(function () {
            const slotId = $(this).data('slot-id');
            splitSlot(slotId);
        });

        $('.unblock-button').click(function () {
            const slotId = $(this).data('slot-id');
            unsplitSlot(slotId);
        });
    }

    function splitSlot(slotId) {
        const slot = $(`#slot${slotId}`);
        const slotName = dataRetrieved[slotId - 1].markName;

        const blockedSlot = {
            markId: ++lastSlotId,
            parkId: 1,
            markName: `${slotName}b`,
            markName_Block: '-',
            isAvailable: true
        };

        const mainSlotIndex = dataRetrieved.findIndex(item => item.markName === slotName);
        if (mainSlotIndex !== -1) {
            dataRetrieved[mainSlotIndex].markName_Block = `${slotName}b`;
        } else {
            console.error(`Main slot ${slotName} not found in dataRetrieved.`);
            return;
        }

        dataRetrieved.push(blockedSlot);
        slot.addClass('blocked').html(`
            <div class="slot-details-blocked">${slotName}</div>
            <div class="slot-details">
                ${slotName}b
                <button class="unblock-button" data-slot-id="${slotId}">Unblock</button>
            </div>
        `);

        // Re-attach the unblock button's click event
        slot.find('.unblock-button').click(function () {
            unsplitSlot(slotId);
        });
    }

    function unsplitSlot(slotId) {
        const slot = $(`#slot${slotId}`);
        const slotName = dataRetrieved[slotId - 1].markName;

        const indexToRemove = dataRetrieved.findIndex(item => item.markName === `${slotName}b`);
        if (indexToRemove !== -1) {
            dataRetrieved.splice(indexToRemove, 1);
        }

        const mainSlotIndex = dataRetrieved.findIndex(item => item.markName === slotName);
        if (mainSlotIndex !== -1) {
            dataRetrieved[mainSlotIndex].markName_Block = '-';
        }

        slot.removeClass('blocked').html(`
            <span>${slotName}</span>
            <div class="slot-details"></div>
            <button class="block-button" data-slot-id="${slotId}">Block</button>
        `);

        // Re-attach the block button's click event
        slot.find('.block-button').click(function () {
            splitSlot(slotId);
        });
    }

    $('#addSlotButton').click(function () {
        addSlotAlert();
    });

    function addSlotAlert() {
        const newSlotId = dataRetrieved.length + 1;
        const newMarkName = `P${newSlotId}`;

        dataRetrieved.push({
            markId: newSlotId,
            parkId: 1,
            markName: newMarkName,
            markName_Block: "-",
            isAvailable: true
        });

        initializeParkingTable(dataRetrieved);
    }

    $('#deleteParkingButton').click(function () {
        deleteParkingChanges();
    });

    function deleteParkingChanges() {
        const api = `${apiBaseUrl}/admin/deleteParkingMarks`;

        ajaxCall('DELETE', api, null, function onSuccess() {
            alert("All parking data has been deleted successfully.");
            fetchParkingData();  // Refresh data after deletion
        }, function onError(xhr, status, error) {
            console.error("Failed to delete all parking:", error);
            alert("Failed to delete all parking data. Please try again.");
        });
    }

    $('#saveParkingChangesButton').click(function () {
        saveParkingChanges();
    });

    function saveParkingChanges() {
        const api = `${apiBaseUrl}/admin/deleteParkingMarks`;
        ajaxCall('DELETE', api, null, addParking, onError);
    }

    function addParking() {
        const api = `${apiBaseUrl}/admin/AddMark`;
        const parkingData = generateParkingData();

        ajaxCall('POST', api, JSON.stringify(parkingData), () => {
            alert("Parking slots added successfully.");
            fetchParkingData();
        }, onAddError);
    }

    function generateParkingData() {
        dataRetrieved.sort((a, b) => {
            const markNameA = a.markName.match(/(\D+)(\d*)/);
            const markNameB = b.markName.match(/(\D+)(\d*)/);

            if (markNameA[1] < markNameB[1]) return -1;
            if (markNameA[1] > markNameB[1]) return 1;

            const numA = parseInt(markNameA[2] || "0", 10);
            const numB = parseInt(markNameB[2] || "0", 10);
            return numA - numB;
        });

        dataRetrieved.forEach((item, index) => {
            if (item.hasOwnProperty('markName')) {
                item.markId = index + 1;
            }
        });

        return dataRetrieved;
    }

    function onAddError(xhr, status, error) {
        alert("Failed to add parking slots.");
        console.error("Error adding parking slots:", error);
    }

    function onError(xhr, status, error) {
        if (xhr.status === 200) {
            addParking();
        } else {
            console.error('Failed to deleteParking', status, error);
            alert('An error occurred. Please try again.');
        }
    }
});