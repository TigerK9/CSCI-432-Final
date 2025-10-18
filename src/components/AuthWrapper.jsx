import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This component protects its children routes by checking for a login status in localStorage.
 * If the user is not logged in and tries to access a protected page, it redirects them to the login page.
 *
 * This should wrap any routes that require authentication.
 */
const AuthWrapper = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        // Define paths that do NOT require authentication.
        const publicPaths = ['/login', '/signup'];

        // If the user is not logged in and is trying to access a protected page...
        if (isLoggedIn !== 'true' && !publicPaths.some(path => location.pathname.startsWith(path))) {
            alert('You must be logged in to view this page.');
            navigate('/login'); // Adjust path as needed
        }
    }, [location, navigate]);

    return children;
};

export default AuthWrapper;