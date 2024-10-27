$(document).ready(function () {



    // Mock reservation data
    const reservationData = {
        spotId: 'B-2',
        startTime: '07:00 AM',
        duration: '2 hours',
        endTime: new Date(new Date().getTime() + 30 * 60 * 1000).toISOString() // 30 minutes from now
    };

    // Function to update the UI with mock data
    function updateUI(data) {
        $('#spot-id').text(data.spotId);
        $('#start-time').text(data.startTime);
        $('#duration').text(data.duration);
        $('#end-time').text(new Date(data.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        startTimer(data.endTime);
    }

    // Function to start the countdown timer
    function startTimer(endTime) {
        const endDateTime = new Date(endTime).getTime();
        const totalDuration = endDateTime - new Date().getTime();

        function updateClock() {
            const now = new Date().getTime();
            const remainingTime = endDateTime - now;

            if (remainingTime < 0) {
                clearInterval(timerInterval);
                $('#timer').text('00:00:00');
                return;
            }

            const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
            const seconds = Math.floor((remainingTime / 1000) % 60);

            $('#timer').text(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            // Calculate progress as a percentage of the total duration
            const progressPercentage = (totalDuration - remainingTime) / totalDuration;

            // Calculate new clip value based on progress
            const newClipValue = 140 - (140 * progressPercentage);

            // Update the clip property of the .progress element
            $('.circle-timer .progress').css('clip', `rect(0px, ${newClipValue}px, 200px, 0px)`);
        }

        updateClock();
        const timerInterval = setInterval(updateClock, 1000);
    }

    // Directly update the UI with the mock data
    updateUI(reservationData);

    $('#extend-time').click(function () {
        alert('Extend Time Clicked'); // Simulate an action
    });

    $('#end-parking').click(function () {
        alert('End Parking Clicked'); // Simulate an action
    });
});