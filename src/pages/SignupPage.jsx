import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/signup_style.css'; // Assuming styles are compatible

const USERS_STORAGE_KEY = 'ronr-users';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const isFormValid = name.trim() !== '' && email.trim() !== '' && password.trim() !== '';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || {};

        if (users[email]) {
            alert('An account with this email already exists. Please log in.');
            return;
        }

        users[email] = {
            password: password,
            role: 'member' // Default role for new signups
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

        alert('Account created successfully! Please log in.');
        navigate('/login');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-custom-gradient p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h2 className="text-center mb-6 text-2xl font-semibold text-gray-800">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-600">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg text-base outline-none transition duration-300 input-focus"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-600">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg text-base outline-none transition duration-300 input-focus"
                        />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg text-base outline-none transition duration-300 input-focus"
                        />
                    </div>
                    <button type="submit" disabled={!isFormValid} className="w-full p-3 mt-4 mb-6 btn-primary text-white font-semibold rounded-lg text-lg transition duration-300 hover:scale-[1.01] active:scale-[0.99] btn-disabled-state">
                        Create Account
                    </button>
                </form>
                <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-link-color hover:underline font-medium">Sign In</Link></p>
            </div>
        </div>
    );
};

export default SignupPage;