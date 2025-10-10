/**
 * This script protects a page by checking for a login status in localStorage.
 * If the user is not logged in, it redirects them to the login page.
 *
 * This should be included in the <head> of any HTML file that requires authentication.
 */
(function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Define paths that do NOT require authentication.
    const publicPaths = ['/login.html', '/signup.html'];

    // If the user is not logged in and is trying to access a protected page...
    if (isLoggedIn !== 'true' && !publicPaths.some(path => window.location.pathname.endsWith(path))) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html'; // Adjust path as needed
    }
})();