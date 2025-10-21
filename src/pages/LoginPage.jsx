import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/login_style.css'; // Assuming styles are compatible

const USERS_STORAGE_KEY = 'ronr-users';

/**
 * A React component for the login page.
 * It handles user authentication and initializes default users if none exist.
 */
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Initialize default users on first load if they don't exist
    useEffect(() => {
        if (!localStorage.getItem(USERS_STORAGE_KEY)) {
            const defaultUsers = {
                'admin@email.com': { password: 'password', role: 'admin' },
                'chairman@email.com': { password: 'password', role: 'chairman' },
                'member@email.com': { password: 'password', role: 'member' }
            };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
        }
    }, []);

    const isFormValid = email.trim() !== '' && password.trim() !== '';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || {};
        const user = users[email];

        if (user && user.password === password) {
            // --- Login Success ---
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('currentUserRole', user.role);
            
            alert('Login successful!');
            navigate('/home'); // Redirect to the home page
        } else {
            // --- Login Failure ---
            alert('Invalid email or password. Please try again.');
            setPassword(''); // Clear password field
        }
    };

    return (
        <div className="login-page-wrapper">
            {/* The main container that the CSS targets */}
            <div className="login-container">
                
                {/* FIX 1: Changed <h1> to <h2> to match the CSS selector (.login-container h2) */}
                <h2>Sign In</h2> 
                
                {/* FIX 2: Removed the redundant descriptive <p> tag that was inside the login-box in the old version */}
                
                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* FIX 3: Added the necessary 'signin-button' class */}
                    <button 
                        type="submit" 
                        id="signInButton"
                        className="signin-button"
                        disabled={!isFormValid}>
                        Sign In
                    </button>
                </form>

                {/* FIX 4: Recreated the structure of the old .links div */}
                <div className="links">
                    <span className="divider">OR</span>
                    {/* Use the React Router Link component */}
                    <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;