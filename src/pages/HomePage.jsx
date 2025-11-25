import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Taskbar from '../components/Taskbar';
import '../css/home_style.css'; // Assuming styles are compatible

const NewMeetingModal = ({ isOpen, onClose, onCreateMeeting }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission which causes a page reload
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
    const fetchMeetings = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/meetings');
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data = await response.json();
        // If the database is empty, you might want to seed it with initial data
        // For now, we'll just set what we get.
        setMeetings(data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setMeetings([]); // Set to empty array on error
      }
    };

    fetchMeetings();
  }, []);

  const handleCreateMeeting = async (newMeeting) => {
    try {
      const response = await fetch('http://localhost:5002/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedMeeting = await response.json();
      setMeetings([...meetings, savedMeeting]);
    } catch (error) {
      console.error("Failed to create meeting:", error);
      alert("Failed to create meeting. Please check the console for more details.");
    }
    setIsModalOpen(false);
  };

  const handleDeleteMeeting = async (e, meetingId, meetingName) => {
    // Stop the click from navigating to the meeting page
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete the meeting "${meetingName}"?`)) {
      try {
        const response = await fetch(`http://localhost:5002/api/meetings/${meetingId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete meeting');
        }

        // Update the UI by filtering out the deleted meeting
        setMeetings(meetings.filter(m => m._id !== meetingId));
      } catch (error) {
        console.error("Error deleting meeting:", error);
        alert("Failed to delete meeting.");
      }
    }
  };

  return (
    <div className="home-page-wrapper">
      <Taskbar />

      <div className="grid-container">
        {meetings.map((meeting) => (
          <Link to={`/meeting/${meeting.meetingId}`} key={meeting._id} className="box-link">
            <div className="box">
              <div className="meeting-name">{meeting.name}</div>
              <div className="meeting-description">{meeting.description}</div>
              <div className="meeting-datetime">{meeting.datetime}</div>
              {(userRole === 'admin' || userRole === 'chairman') && (
                <button className="delete-meeting-btn" onClick={(e) => handleDeleteMeeting(e, meeting._id, meeting.name)}>
                  <i className="bi-trash"></i>
                </button>
              )}
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
    </div>
  );
};

export default HomePage;