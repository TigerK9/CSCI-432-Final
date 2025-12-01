import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import Taskbar from '../components/Taskbar';
import { checkAuthAndRedirect, getValidToken } from '../utils/auth';
import '../css/profileEditor_style.css'; 

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editData, setEditData] = useState({
        name: '', 
        description: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = checkAuthAndRedirect(navigate);
            if (!token) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                setProfile(data);
                setEditData(data); 
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
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editData.name,
                    description: editData.description,
                    phone: editData.phone,
                })
            });
            if (!response.ok) throw new Error('Failed to update profile');
            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            localStorage.setItem('currentUserName', updatedProfile.name);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert('Failed to update profile.');
        }
    };

    if (!profile) {
        return <div className="loading-state">Loading profile...</div>;
    }
    
    return (
        <div className="profile-page-wrapper">
            <Taskbar />

            <div className="content-area">
                <div className="profile-editor-box">

                    {/* Left Column: Profile Picture */}
                    <div className="profile-picture-section">
                        <div className="profile-picture-placeholder">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                        </div>
                    </div>

                    {/* Right Column: Inputs */}
                    <div className="profile-input-fields">
                        
                        <div className="input-group">
                            <label htmlFor="name">Full Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={editData.name} 
                                onChange={handleInputChange} 
                                placeholder="Enter your name" 
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={editData.description}
                                onChange={handleInputChange}
                                placeholder="A brief description of yourself"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={editData.email} 
                                readOnly // React camelCase for readOnly attribute
                                placeholder="your@example.com"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                value={editData.phone} 
                                onChange={handleInputChange} 
                                placeholder="123-456-7890" 
                            />
                        </div>
                        
                        <div className="button-container">
                            <button 
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
};

export default ProfilePage;