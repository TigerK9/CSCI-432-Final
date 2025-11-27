/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if expired or invalid, false if still valid
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        // JWT tokens are base64 encoded with 3 parts: header.payload.signature
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // exp is in seconds, Date.now() is in milliseconds
        const expirationTime = payload.exp * 1000;
        
        return Date.now() >= expirationTime;
    } catch (error) {
        // If we can't parse the token, consider it expired
        return true;
    }
};

/**
 * Get the token from localStorage and check if it's valid
 * @returns {string|null} - The token if valid, null if expired or missing
 */
export const getValidToken = () => {
    const token = localStorage.getItem('token');
    
    if (isTokenExpired(token)) {
        // Clear auth data if token is expired
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        return null;
    }
    
    return token;
};

/**
 * Check auth and redirect to login if token is expired
 * @param {function} navigate - React Router's navigate function
 * @returns {string|null} - The token if valid, null if redirecting to login
 */
export const checkAuthAndRedirect = (navigate) => {
    const token = getValidToken();
    
    if (!token) {
        navigate('/login');
        return null;
    }
    
    return token;
};
