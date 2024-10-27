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