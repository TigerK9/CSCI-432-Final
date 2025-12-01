import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Taskbar from '../components/Taskbar';
import '../css/home_style.css'; // Assuming styles are compatible

const NewMeetingModal = ({ isOpen, onClose, onCreateMeeting, onJoinMeeting }) => {
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Reset join fields when modal opens
      setJoinCode('');
      setJoinError('');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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

  const handleJoinSubmit = async () => {
    if (joinCode.length !== 6) {
      setJoinError('Please enter a 6-character code');
      return;
    }

    setJoinLoading(true);
    setJoinError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/meetings/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setJoinError(data.message || 'Failed to join meeting');
        setJoinLoading(false);
        return;
      }

      onJoinMeeting(data.meeting);
      onClose();
    } catch (error) {
      console.error('Error joining meeting:', error);
      setJoinError('Error joining meeting');
    }
    setJoinLoading(false);
  };

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content combined-meeting-modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        
        {/* Create New Meeting Section */}
        <div className="modal-section">
          <h2>Create a New Meeting</h2>
          <form id="meetingForm" onSubmit={handleSubmit}>
            <label htmlFor="meetingName">Meeting Name:</label>
            <input type="text" id="meetingName" name="meetingName" required />

            <label htmlFor="meetingDescription">Description:</label>
            <textarea id="meetingDescription" name="meetingDescription" rows="3" placeholder="What is this meeting about?"></textarea>

            <label htmlFor="meetingDate">Date & Time:</label>
            <input type="datetime-local" id="meetingDate" name="meetingDate" required />

            <button type="submit">Create Meeting</button>
          </form>
        </div>

        {/* Divider */}
        <div className="modal-divider">
          <span>OR</span>
        </div>

        {/* Join Meeting Section */}
        <div className="modal-section join-section">
          <h2>Join a Meeting</h2>
          <p className="join-modal-description">Enter the 6-character code provided by your chairman</p>
          <input
            type="text"
            className="join-code-input"
            placeholder="Enter code"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value.toUpperCase().slice(0, 6)); setJoinError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinSubmit()}
            maxLength={6}
          />
          {joinError && <p className="join-error">{joinError}</p>}
          <button className="join-submit-btn" onClick={handleJoinSubmit} disabled={joinLoading}>
            {joinLoading ? 'Joining...' : 'Join Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ParticipantsModal = ({ isOpen, onClose, meetingId, meetingName, initialParticipants, joinCode, onSave }) => {
  const [participants, setParticipants] = useState([]); // Array of { _id, name, email }
  const [editedParticipantIds, setEditedParticipantIds] = useState([]);
  const [originalParticipantIds, setOriginalParticipantIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [addError, setAddError] = useState('');
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  
  const currentUserId = localStorage.getItem('currentUserId');

  // Check if changes have been made
  const hasChanges = () => {
    if (originalParticipantIds.length !== editedParticipantIds.length) return true;
    const sortedOriginal = [...originalParticipantIds].sort();
    const sortedEdited = [...editedParticipantIds].sort();
    return !sortedOriginal.every((id, index) => id === sortedEdited[index]);
  };

  useEffect(() => {
    if (!isOpen) {
      setParticipants([]);
      setEditedParticipantIds([]);
      setOriginalParticipantIds([]);
      setEmailInput('');
      setAddError('');
      setShowUnsavedWarning(false);
      return;
    }
    
    // Use the pre-populated participants directly - no extra fetch needed!
    if (initialParticipants && initialParticipants.length > 0) {
      setParticipants(initialParticipants);
      const ids = initialParticipants.map(p => p._id);
      setEditedParticipantIds(ids);
      setOriginalParticipantIds(ids);
    } else {
      setParticipants([]);
      setEditedParticipantIds([]);
      setOriginalParticipantIds([]);
    }
  }, [isOpen, initialParticipants]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleAttemptClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, editedParticipantIds, originalParticipantIds]);

  if (!isOpen) return null;

  const handleAttemptClose = () => {
    if (hasChanges()) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  const handleKeepEditing = () => {
    setShowUnsavedWarning(false);
  };

  const handleRemoveParticipant = (userId) => {
    setEditedParticipantIds(editedParticipantIds.filter(id => id !== userId));
    setParticipants(participants.filter(p => p._id !== userId));
  };

  const handleAddParticipant = async () => {
    if (!emailInput.trim()) return;
    
    setAddError('');
    
    // Check if already added
    if (participants.some(p => p.email.toLowerCase() === emailInput.toLowerCase())) {
      setAddError('User is already a participant');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/api/users/by-email/${encodeURIComponent(emailInput.trim())}`);
      if (!response.ok) {
        setAddError('User not found');
        return;
      }
      
      const user = await response.json();
      
      // Check if already in the list by ID
      if (editedParticipantIds.includes(user._id)) {
        setAddError('User is already a participant');
        return;
      }
      
      setParticipants([...participants, user]);
      setEditedParticipantIds([...editedParticipantIds, user._id]);
      setEmailInput('');
    } catch (error) {
      console.error('Error adding participant:', error);
      setAddError('Error adding user');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/meetings/${meetingId}/participants`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participants: editedParticipantIds }),
      });

      if (response.ok) {
        onSave(editedParticipantIds);
        onClose();
      }
    } catch (error) {
      console.error('Error saving participants:', error);
    }
  };

  return (
    <div className="participants-modal-backdrop" onClick={handleAttemptClose}>
      <div className="participants-modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={handleAttemptClose}>&times;</span>
        <h2>Participants</h2>
        <p className="participants-meeting-name">{meetingName}</p>
        
        {joinCode && (
          <div className="join-code-display">
            <span className="join-code-value">{joinCode}</span>
          </div>
        )}
        
        <div className="add-participant-section">
          <div className="add-participant-input-row">
            <input
              type="email"
              placeholder="Enter email to add participant"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setAddError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
            />
            <button className="add-participant-btn" onClick={handleAddParticipant}>
              <i className="bi-plus"></i>
            </button>
          </div>
          {addError && <p className="add-participant-error">{addError}</p>}
        </div>

        <div className="participants-list">
          {loading ? (
            <p className="no-participants">Loading...</p>
          ) : participants.length > 0 ? (
            participants
              .filter(p => editedParticipantIds.includes(p._id))
              .sort((a, b) => {
                // Current user always first
                if (a._id === currentUserId) return -1;
                if (b._id === currentUserId) return 1;
                // Rest sorted alphabetically by name
                return a.name.localeCompare(b.name);
              })
              .map((participant) => (
              <div key={participant._id} className="participant-item">
                <i className="bi-person-circle"></i>
                <div className="participant-info">
                  <span className="participant-name">{participant.name}</span>
                  <span className="participant-email">{participant.email}</span>
                </div>
                {participant._id !== currentUserId && (
                  <button className="remove-participant-btn" onClick={() => handleRemoveParticipant(participant._id)}>
                    <i className="bi-x"></i>
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="no-participants">No participants yet.</p>
          )}
        </div>
        <div className="participants-modal-buttons">
          <button className="cancel-btn" onClick={handleAttemptClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      {showUnsavedWarning && (
        <div className="unsaved-warning-modal" onClick={(e) => e.stopPropagation()}>
          <h3>Unsaved Changes</h3>
          <p>You have unsaved changes. Are you sure you want to close without saving?</p>
          <div className="unsaved-warning-buttons">
            <button className="keep-editing-btn" onClick={handleKeepEditing}>Keep Editing</button>
            <button className="discard-btn" onClick={handleDiscardChanges}>Discard Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [meetings, setMeetings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, meetingId: null, meetingName: '' });
  const [participantsModal, setParticipantsModal] = useState({ show: false, meetingId: null, meetingName: '', initialParticipants: [], joinCode: '' });
  const userRole = localStorage.getItem('currentUserRole');
  const currentUserId = localStorage.getItem('currentUserId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5002/api/meetings', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data = await response.json();
        setMeetings(data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setMeetings([]); // Set to empty array on error
      }
    };

    fetchMeetings();
  }, [userRole, currentUserId]);

  const handleCreateMeeting = async (newMeeting) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
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

  const handleDeleteClick = (e, meetingId, meetingName) => {
    // Stop the click from navigating to the meeting page
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ show: true, meetingId, meetingName });
  };

  const handleConfirmDelete = async () => {
    const { meetingId } = deleteConfirm;
    setDeleteConfirm({ show: false, meetingId: null, meetingName: '' });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      // Update the UI by filtering out the deleted meeting
      setMeetings(meetings.filter(m => m._id !== meetingId));
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  const handlePeopleClick = async (e, meeting) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fetch fresh meeting data with populated participants (name, email included)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/meetings/${meeting.meetingId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const freshMeeting = await response.json();
        // participants now come with _id, name, email populated from backend
        setParticipantsModal({ 
          show: true, 
          meetingId: meeting._id, 
          meetingName: freshMeeting.name, 
          initialParticipants: freshMeeting.participants || [],
          joinCode: freshMeeting.joinCode || ''
        });
      } else {
        // Fallback to cached data if fetch fails
        setParticipantsModal({ 
          show: true, 
          meetingId: meeting._id, 
          meetingName: meeting.name, 
          initialParticipants: meeting.participants || [],
          joinCode: meeting.joinCode || ''
        });
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
      // Fallback to cached data
      setParticipantsModal({ 
        show: true, 
        meetingId: meeting._id, 
        meetingName: meeting.name, 
        initialParticipants: meeting.participants || [],
        joinCode: meeting.joinCode || ''
      });
    }
  };

  const handleSaveParticipants = (updatedParticipantIds) => {
    const { meetingId } = participantsModal;
    // Update the local state
    setMeetings(meetings.map(m => 
      m._id === meetingId ? { ...m, participants: updatedParticipantIds } : m
    ));
  };

  const handleJoinMeeting = (meeting) => {
    // Add the meeting to the list if not already there
    if (!meetings.find(m => m._id === meeting._id)) {
      setMeetings([...meetings, meeting]);
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
              {(() => {
                const isChair = String(meeting.chairman) === currentUserId;
                const canSeeCode = userRole === 'admin' || isChair;
                return (
                  <>
                    {canSeeCode && meeting.joinCode && (
                      <div className="meeting-code" style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                        {/* <span style={{ fontWeight: '600', marginRight: 8 }}>Code: {meeting.joinCode}</span> */}
                      </div>
                    )}

                    {(userRole === 'admin' || isChair) && (
                      <>
                        <button className="people-meeting-btn" onClick={(e) => handlePeopleClick(e, meeting)}>
                          <i className="bi-people"></i>
                        </button>
                        <button className="delete-meeting-btn" onClick={(e) => handleDeleteClick(e, meeting._id, meeting.name)}>
                          <i className="bi-trash"></i>
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </Link>
        ))}

        <div className="box new-meeting" onClick={() => setIsModalOpen(true)}>
          <div className="plus">+</div>
          <div>New Meeting</div>
        </div>
      </div>

      <NewMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateMeeting={handleCreateMeeting}
        onJoinMeeting={handleJoinMeeting}
      />

      {deleteConfirm.show && (
        <div className="confirm-modal-backdrop" onClick={() => setDeleteConfirm({ show: false, meetingId: null, meetingName: '' })}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete Meeting</h3>
            <p>Are you sure you want to delete "{deleteConfirm.meetingName}"? This action cannot be undone.</p>
            <div className="confirm-modal-buttons">
              <button className="cancel-btn" onClick={() => setDeleteConfirm({ show: false, meetingId: null, meetingName: '' })}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <ParticipantsModal
        isOpen={participantsModal.show}
        onClose={() => setParticipantsModal({ show: false, meetingId: null, meetingName: '', initialParticipants: [], joinCode: '' })}
        meetingId={participantsModal.meetingId}
        meetingName={participantsModal.meetingName}
        initialParticipants={participantsModal.initialParticipants}
        joinCode={participantsModal.joinCode}
        onSave={handleSaveParticipants}
      />
    </div>
  );
};

export default HomePage;