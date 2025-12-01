import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Taskbar = ({ centerContent }) => {
    const navigate = useNavigate();
    return (
        <div className="taskbar">
            <div className="taskbar-left">
                <Link to="/home" className="taskbar-icon" title="Home">
                    <i className="bi-house"></i>
                </Link>
            </div>
            {centerContent && (
                <div className="taskbar-center">
                    {centerContent}
                </div>
            )}
            <div className="taskbar-right">
                <Link to="/profile" className="taskbar-icon" title="Profile">
                    <i className="bi-person"></i>
                </Link>
                <a href="#" onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                }} className="taskbar-icon" title="Logout">
                    <i className="bi-box-arrow-right"></i>
                </a>
            </div>
        </div>
    );
};

export default Taskbar;
