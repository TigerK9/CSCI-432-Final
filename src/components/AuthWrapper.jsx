import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/auth';

/**
 * This component protects its children routes by checking for a login status in localStorage.
 * If the user is not logged in or their token is expired, it redirects them to the login page.
 *
 * This should wrap any routes that require authentication.
 */
const AuthWrapper = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const token = localStorage.getItem('token');

        // Define paths that do NOT require authentication.
        const publicPaths = ['/login', '/signup'];

        // Skip check for public paths
        if (publicPaths.some(path => location.pathname.startsWith(path))) {
            return;
        }

        // Check if user is not logged in
        if (isLoggedIn !== 'true') {
            alert('You must be logged in to view this page.');
            navigate('/login');
            return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserRole');
            localStorage.removeItem('currentUserName');
            
            alert('Your session has expired. Please log in again.');
            navigate('/login');
        }
    }, [location, navigate]);

    return children;
};

export default AuthWrapper;