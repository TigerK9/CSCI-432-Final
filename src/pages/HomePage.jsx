import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/home_style.css'; // Assuming styles are compatible

const MEETINGS_STORAGE_KEY = 'ronr-meetingsData';

const initialMeetingsData = [
  {
    name: "Meeting 1",
    description: "Project kickoff discussion",
    datetime: "Sept 25, 2025 · 2:00 PM",
    link: "/meeting/1", // Using React Router friendly links
  },
  {
    name: "Meeting 2",
    description: "Design brainstorming session",
    datetime: "Sept 26, 2025 · 11:00 AM",
    link: "/meeting/2",
  },
  {
    name: "Meeting 3",
    description: "Weekly status update",
    datetime: "Sept 27, 2025 · 9:30 AM",
    link: "/meeting/3",
  },
];

const NewMeetingModal = ({ isOpen, onClose, onCreateMeeting }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('meetingName');
    const description = formData.get('meetingDescription');
    const date = formData.get('meetingDate');

    const newMeeting = {
      name,
      description: description || 'No description provided.',
      datetime: new Date(date).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
      }).replace(',', ' ·'),
      link: `/meeting/${Date.now()}`, // Generate a unique link/ID
    };

    onCreateMeeting(newMeeting);
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Create a New Meeting</h2>
        <form id="meetingForm" onSubmit={handleSubmit}>
          <label htmlFor="meetingName">Meeting Name:</label>
          <input type="text" id="meetingName" name="meetingName" required />

          <label htmlFor="meetingDescription">Description:</label>
          <textarea id="meetingDescription" name="meetingDescription" rows="3" placeholder="What is this meeting about?"></textarea>

          <label htmlFor="meetingDate">Date & Time:</label>
          <input type="datetime-local" id="meetingDate" name="meetingDate" required />

          <button type="submit">Save Meeting</button>
        </form>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [meetings, setMeetings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userRole = localStorage.getItem('currentUserRole');
  const navigate = useNavigate();

  useEffect(() => {
    const storedMeetings = localStorage.getItem(MEETINGS_STORAGE_KEY);
    let meetingsData;
    try {
      meetingsData = storedMeetings ? JSON.parse(storedMeetings) : initialMeetingsData;
    } catch (e) {
      console.error("Error parsing meetings from localStorage", e);
      meetingsData = initialMeetingsData;
    }
    setMeetings(meetingsData);
    if (!storedMeetings) {
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetingsData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserRole');
    navigate('/login');
  };

  const handleCreateMeeting = (newMeeting) => {
    const updatedMeetings = [...meetings, newMeeting];
    setMeetings(updatedMeetings);
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updatedMeetings));
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="taskbar">
        <div className="taskbar-left">
          <Link to="/home" className="taskbar-icon" title="Home">
            <i className="bi-house"></i>
          </Link>
        </div>
        <div className="taskbar-right">
          <Link to="/profile" className="taskbar-icon" title="Profile">
            <i className="bi-person"></i>
          </Link>
          <a href="#" onClick={handleLogout} className="taskbar-icon" title="Logout">
            <i className="bi-box-arrow-right"></i>
          </a>
        </div>
      </div>

      <div className="grid-container">
        {meetings.map((meeting, index) => (
          <Link to={meeting.link} key={index} className="box-link">
            <div className="box">
              <div className="meeting-name">{meeting.name}</div>
              <div className="meeting-description">{meeting.description}</div>
              <div className="meeting-datetime">{meeting.datetime}</div>
            </div>
          </Link>
        ))}

        {(userRole === 'admin' || userRole === 'chairman') && (
          <div className="box new-meeting" onClick={() => setIsModalOpen(true)}>
            <div className="plus">+</div>
            <div>New Meeting</div>
          </div>
        )}
      </div>

      <NewMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateMeeting={handleCreateMeeting}
      />
    </>
  );
};

export default HomePage;