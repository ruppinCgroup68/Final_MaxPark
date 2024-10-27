$(document).ready(function () {
    // Retrieve the 'res' object from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('res'));

    if (userData) {
        // Log the entire userData object to inspect its structure
        console.log("Retrieved userData:", userData);

        // Check if the properties exist before using them
        const userFirstName = userData.userFirstName || "Unknown";
        const userLastName = userData.userLastName || "Unknown";

        // Construct the full name
        const fullName = `${userFirstName} ${userLastName}`;

        // Set the username span to display the user's full name
        $('.userFullName').text(`Hello, ${fullName}`);
    } else {
        console.error("No user data found in sessionStorage.");
    }
});