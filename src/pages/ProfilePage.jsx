import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/profileEditor_style.css'; // Importing the correct CSS file

const PROFILE_STORAGE_KEY = 'ronr-profileData';

const initialProfileData = {
    name: 'John Doe',
    description: 'A passionate developer.',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    profilePicture: '' // Add field for profile picture
};

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        description: '',
        email: '',
        phone: '',
        profilePicture: '' // Add field for profile picture
    });

    useEffect(() => {
        const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        const currentUserEmail = localStorage.getItem('currentUserEmail');
        const currentUserName = localStorage.getItem('currentUserName');
        let profileData;
        try {
            profileData = storedProfile ? JSON.parse(storedProfile) : initialProfileData;
        } catch (e) {
            console.error("Error parsing profile data from localStorage", e);
            profileData = initialProfileData;
        }

        // If this is the first load, populate with user data, otherwise use stored data
        if (!storedProfile) {
            profileData.name = currentUserName || '';
            profileData.email = currentUserEmail || '';
        }

        setProfile(profileData);
        // Pre-fill editData with current profile data for better UX
        setEditData(profileData);

        if (!storedProfile) {
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result is a Base64 string which can be stored and displayed
                setEditData(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        // Use the current editData state directly, as it should hold the full form data
        const updatedProfile = {
            name: editData.name,
            description: editData.description,
            email: editData.email,
            phone: editData.phone,
            profilePicture: editData.profilePicture, // Save the picture
        };

        setProfile(updatedProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
        
        alert('Profile updated successfully!');
    };

    if (!profile) {
        return <div>Loading profile...</div>;
    }
    
    // --- JSX START ---
    return (
        <div className="profile-page-wrapper">
            {/* Taskbar structure is mostly correct, but needs the right-side icons if they existed */}
            <div className="taskbar">
                <div className="taskbar-left">
                    <Link to="/home" className="taskbar-icon" title="Home">
                        <i className="bi-house"></i>
                    </Link>
                </div>
                {/* Re-add taskbar-right section from original HTML if needed */}
                <div className="taskbar-right">
                    <Link to="/profile" className="taskbar-icon" title="Profile">
                        <i className="bi-person"></i>
                    </Link>
                </div>
            </div>

            {/* FIX 1: Restore the main centering container */}
            <div className="content-area">
                {/* FIX 2: Restore the main background box container */}
                <div className="profile-editor-box">

                    {/* Left Column: Profile Picture Section */}
                    <div className="profile-picture-section">
                        {/* Restore the profile picture placeholder HTML */}
                        <div className="profile-picture-placeholder">
                            {editData.profilePicture ? (
                                <img src={editData.profilePicture} alt="Profile Preview" />
                            ) : (
                                <span>Profile Picture</span>
                            )}
                        </div>
                        {/* Hidden file input */}
                        <input
                            type="file"
                            id="photo-upload"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {/* Styled button that triggers the file input */}
                        <label htmlFor="photo-upload" className="save-button" style={{ cursor: 'pointer', textAlign: 'center' }}>
                            Upload Photo
                        </label>
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