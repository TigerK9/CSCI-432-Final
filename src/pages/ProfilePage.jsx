import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Taskbar from '../components/Taskbar';
import { checkAuthAndRedirect, getValidToken } from '../utils/auth';
import '../css/profileEditor_style.css'; // Importing the correct CSS file

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editData, setEditData] = useState({
        name: '', // name is now part of the user model
        description: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = checkAuthAndRedirect(navigate);
            if (!token) {
                // Token expired or missing - user will be redirected to login
                return;
            }
            try {
                const response = await fetch('http://localhost:5002/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                setProfile(data);
                setEditData(data); // Pre-fill form with fetched data
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        const token = getValidToken();
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editData.name,
                    description: editData.description,
                    phone: editData.phone,
                    // profilePicture is no longer sent
                })
            });
            if (!response.ok) throw new Error('Failed to update profile');
            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            // Also update the name in localStorage if it changed
            localStorage.setItem('currentUserName', updatedProfile.name);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert('Failed to update profile.');
        }
    };

    if (!profile) {
        return <div>Loading profile...</div>;
    }
    
    // --- JSX START ---
    return (
        <div className="profile-page-wrapper">
            <Taskbar />

            {/* FIX 1: Restore the main centering container */}
            <div className="content-area">
                {/* FIX 2: Restore the main background box container */}
                <div className="profile-editor-box">

                    {/* Left Column: Profile Picture Section */}
                    <div className="profile-picture-section">
                        {/* Restore the profile picture placeholder HTML */}
                        <div className="profile-picture-placeholder" style={{ fontSize: '8rem', color: 'white', backgroundColor: '#607d8b' }}>
                            {profile.name ? profile.name.charAt(0).toUpperCase() : ''}
                        </div>
                    </div>

                    {/* Right Column: Input Fields (This is where the 'profile-input-fields' class is required) */}
                    <div className="profile-input-fields">
                        
                        {/* Input Group: Name */}
                        <div className="input-group">
                            <label htmlFor="name">Name:</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={editData.name} 
                                onChange={handleInputChange} 
                                placeholder="Enter your name" 
                            />
                        </div>

                        {/* Input Group: Description (Using input type=text to match old HTML for style compatibility) */}
                        <div className="input-group">
                            <label htmlFor="description">Description:</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={editData.description}
                                onChange={handleInputChange}
                                placeholder="A brief description of yourself"
                            />
                        </div>

                        {/* Input Group: Email */}
                        <div className="input-group">
                            <label htmlFor="email">Email:</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={editData.email} 
                                onChange={handleInputChange} 
                                placeholder="your@example.com"
                                readOnly // Email should be tied to the account
                            />
                        </div>

                        {/* Input Group: Phone */}
                        <div className="input-group">
                            <label htmlFor="phone">Phone Number:</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                value={editData.phone} 
                                onChange={handleInputChange} 
                                placeholder="123-456-7890" 
                            />
                        </div>
                        
                        {/* Button Container and Button */}
                        <div className="button-container">
                            <button 
                                id="saveButton" 
                                type="submit" 
                                className="save-button" 
                                onClick={handleSaveChanges}>
                                Save Changes
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
    // --- JSX END ---
};

export default ProfilePage;