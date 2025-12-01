import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import '../css/meeting_style.css';
import '../css/member_view.css';
import '../css/pending_motions.css';
import PendingMotionsReview from '../components/PendingMotionsReview';
import VotingResults from '../components/VotingResults';
import DraggableList from '../components/DraggableList';
import MemberView from '../components/MemberView';
import Taskbar from '../components/Taskbar';
import AgendaSidebar from '../components/AgendaSidebar';
import MotionQueueSidebar from '../components/MotionQueueSidebar';
import CenterContent from '../components/CenterContent';

const MeetingPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [meetingData, setMeetingData] = useState(null);
    const [isAgendaEditing, setIsAgendaEditing] = useState(false);
    const [isMotionQueueEditing, setIsMotionQueueEditing] = useState(false);
    const [showPendingMotions, setShowPendingMotions] = useState(false);
    const [newMotion, setNewMotion] = useState({ name: '', description: '', creator: '' });
    const [proposedMotion, setProposedMotion] = useState({ 
        name: '', 
        description: '', 
        status: 'pending'
    });
    const [isSubmittingMotion, setIsSubmittingMotion] = useState(false);
    const [isProposingMotion, setIsProposingMotion] = useState(false);
    const [votingMotion, setVotingMotion] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null);
    const [showVotingResults, setShowVotingResults] = useState(false);
    const [justVotedInMotionId, setJustVotedInMotionId] = useState(null);
    const [isCompletingVote, setIsCompletingVote] = useState(false);
    const [votingResults, setVotingResults] = useState(null);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [notFound, setNotFound] = useState(false);
    
    const userRole = localStorage.getItem('currentUserRole');
    const userId = localStorage.getItem('currentUserId');
    // Determine chairman status from the meeting data (meeting.chairman) so
    // the meeting creator retains chairman permissions regardless of their account role.
    // Admins keep global chairman privileges.
    const isChairman = (meetingData && String(meetingData.chairman) === userId) || userRole === 'admin';
    const endedRedirectedRef = useRef(false);

    const fetchMeetingData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (response.status === 403) {
                // User is not authorized to access this meeting
                alert('You are not authorized to access this meeting.');
                navigate('/home');
                return;
            }
            
            if (response.status === 404) {
                // Meeting not found (deleted)
                setNotFound(true);
                return;
            }
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Update all state with latest data
            setMeetingData(data);

            // If the meeting was ended, redirect participants to the minutes page once.
            if (data && data.ended && !endedRedirectedRef.current) {
                endedRedirectedRef.current = true;
                try {
                    navigate(`/minutes/${meetingId}`);
                } catch (e) {
                    console.error('Failed to navigate to minutes after meeting end:', e);
                }
            }
            
            
            // Check for active voting motion
            const foundVotingMotion = data.motionQueue.find(m => m.status === 'voting');
            if (foundVotingMotion) {
                // Only update state if voting motion changed (by ID) to prevent re-render loops
                setVotingMotion(prev => {
                    if (!prev || prev._id !== foundVotingMotion._id) {
                        return foundVotingMotion;
                    }
                    // Update the motion data but keep the same reference if ID matches
                    return { ...prev, ...foundVotingMotion };
                });
                
                const now = new Date();
                const endsAt = new Date(foundVotingMotion.votingEndsAt);
                const timeRemaining = Math.max(0, endsAt - now);
                setTimeLeft(timeRemaining);

                // Check localStorage first for the most immediate feedback
                const storedVote = localStorage.getItem(`voted-${meetingId}-${foundVotingMotion._id}`);
                if (storedVote) {
                    // If a vote is stored locally, trust it as the source of truth
                    // and only update state if it's different, to prevent re-renders.
                    if (!hasVoted || selectedVote !== storedVote) {
                        setHasVoted(true);
                        setSelectedVote(storedVote);
                    }
                } else {
                    // If no local vote, sync with the server state.
                    const userHasVotedOnServer = foundVotingMotion.voterIds && foundVotingMotion.voterIds.some(voter => voter.userId === userId);
                    const serverVote = userHasVotedOnServer ? (foundVotingMotion.voterIds.find(voter => voter.userId === userId).vote) : null;
                    
                    if (hasVoted !== userHasVotedOnServer || selectedVote !== serverVote) {
                        setHasVoted(userHasVotedOnServer);
                        setSelectedVote(serverVote);
                    }
                }
            } else {
                // No voting motion found, clear it if we had one
                setVotingMotion(prev => prev ? null : prev);
            }
        } catch (error) {
            console.error("Failed to fetch meeting data:", error);
        }
    };

    useEffect(() => {
        // Reset selectedVote when a new voting session starts
        if (!votingMotion) {
            setHasVoted(false);
            setSelectedVote(null);
        }
    }, [votingMotion?._id]); // Only trigger when voting motion ID changes

    // Track if there's an active vote (by ID, not object reference)
    const activeVoteId = votingMotion?._id || null;

    // Setup data fetching and polling
    useEffect(() => {
        // Don't fetch or poll if meeting was not found
        if (notFound) return;
        
        fetchMeetingData();
        
        // Members poll every 10 seconds
        // Chairman polls every 3 seconds during active voting (to manage vote completion), otherwise 10 seconds
        const pollIntervalMs = (isChairman && activeVoteId) ? 3000 : 10000;
        const pollInterval = setInterval(fetchMeetingData, pollIntervalMs);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [meetingId, activeVoteId, isChairman, notFound]); // Use activeVoteId (string) instead of votingMotion (object)

    const handleVotingComplete = async (motion) => {
        if (!motion || !meetingData || isCompletingVote) return;

        // Check the latest status from meetingData
        const currentMotionInQueue = meetingData.motionQueue.find(m => m._id === motion._id);
        if (!currentMotionInQueue || currentMotionInQueue.status !== 'voting') return;

        try {
            setIsCompletingVote(true);
            const motionIndex = meetingData.motionQueue.findIndex(m => m._id === currentMotionInQueue._id);
            if (motionIndex === -1) return;

            // Immediately update local state to prevent further votes
            setTimeLeft(0);
            setHasVoted(true);

            const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/complete-voting/${motionIndex}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            // Show voting results
            setVotingResults(data.motion);
            setShowVotingResults(true);
            
            // Clean up localStorage for the completed motion
            localStorage.removeItem(`voted-${meetingId}-${motion._id}`);
            setVotingMotion(null);
            setTimeLeft(null);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete voting');
            }

            // Immediate fetch to update other parts of the UI
            fetchMeetingData();
        } catch (error) {
            console.error('Error completing voting:', error);
            // Still try to update the UI even if completion fails
            setVotingMotion(null);
            setTimeLeft(null);
            fetchMeetingData();
        } finally {
            setIsCompletingVote(false);
        }
    };

    useEffect(() => {
        if (timeLeft === null || !votingMotion) return;

        if (timeLeft <= 0) {
            if (votingMotion.status === 'voting') {
                handleVotingComplete(votingMotion);
            }
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => (prev !== null ? Math.max(0, prev - 1000) : null));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, votingMotion, meetingData, meetingId]);

    const saveData = async (newData) => {
        setMeetingData(newData);
        await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newData),
        });
    };

    const handleAgendaNav = (direction) => {
        const newIndex = meetingData.currentAgendaIndex + direction;
        if (newIndex >= 0 && newIndex < meetingData.agenda.length) {
            saveData({ ...meetingData, currentAgendaIndex: newIndex });
        }
    };

    const handleMotionNav = (direction) => {
        // Get non-pending motions with their original indices
        const visibleMotions = meetingData.motionQueue
            .map((m, i) => ({ motion: m, fullIndex: i }))
            .filter(x => x.motion.status !== 'pending');
        
        // Find current position in visible list
        const currentVisibleIndex = visibleMotions.findIndex(
            x => x.fullIndex === meetingData.currentMotionIndex
        );
        
        // Calculate new position in visible list
        const newVisibleIndex = currentVisibleIndex + direction;
        
        // Check bounds against visible motions only
        if (newVisibleIndex >= 0 && newVisibleIndex < visibleMotions.length) {
            // Get the actual full index from the visible motion
            const newFullIndex = visibleMotions[newVisibleIndex].fullIndex;
            saveData({ ...meetingData, currentMotionIndex: newFullIndex });
        }
    };

    const handleMotionReview = async (motionIndex, action) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/meetings/${meetingId}/motions/${motionIndex}/review`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ action })
                }
            );

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                console.error('Server response while reviewing motion:', { status: response.status, statusText: response.statusText, data });
                throw new Error(data && data.message ? data.message : 'Failed to review motion');
            }

            // If backend returns updated meeting, use it for instant UI update
            if (data && data.meeting) {
                setMeetingData(data.meeting);
            } else {
                // Fallback: fetch latest data
                await fetchMeetingData();
            }
        } catch (error) {
            console.error('Error reviewing motion:', error);
            alert('Failed to review motion. Please try again.');
        }
    };

    const handleAddMotionItem = () => {
        if (newMotion.name.trim() && newMotion.creator.trim()) {
            const newData = { ...meetingData, motionQueue: [...meetingData.motionQueue, newMotion] };
            saveData(newData);
            setNewMotion({ name: '', description: '', creator: '' });
        }
    };

    const handleProposeMotion = async () => {
        if (!proposedMotion.name.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const currentUserName = localStorage.getItem('currentUserName');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Send to server first
            const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/propose-motion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...proposedMotion,
                    creator: currentUserName
                })
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('Server response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data
                });
                // Revert the optimistic update
                fetchMeetingData();
                throw new Error(data.message || `Failed to propose motion: ${response.status} ${response.statusText}`);
            }

            // Success - fetch latest data to ensure sync
            await fetchMeetingData();

            // Reset the form and close the propose UI so user sees the previous screen
            setProposedMotion({ name: '', description: '', status: 'pending' });
            setIsProposingMotion(false);
        } catch (error) {
            console.error('Error proposing motion:', error);
            alert('Failed to propose motion. Please make sure you are logged in and the meeting exists.');
        }
    };

    const handleStartVote = async (motionIndex) => {
        try {
            await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/start-vote/${motionIndex}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Error starting vote:', error);
        }
    };

    const handleEndMeeting = async () => {
        try {
            const updated = { ...meetingData, ended: true };
            setMeetingData(updated);
            await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updated),
            });
        } catch (e) {
            console.error('Failed to persist meeting end flag', e);
        }
        navigate(`/minutes/${meetingId}`);
    };

    const handleVote = async (vote) => {
        if (!votingMotion || hasVoted) return;

        // Store vote in localStorage for persistence FIRST, then update state
        localStorage.setItem(`voted-${meetingId}-${votingMotion._id}`, vote);
        setHasVoted(true);
        setSelectedVote(vote);

        try {
            // Submit vote to server
            const motionIndex = meetingData.motionQueue.findIndex(m => m._id === votingMotion._id);
            const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/vote/${motionIndex}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ vote })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // On failure, revert the optimistic UI update and clear localStorage
                localStorage.removeItem(`voted-${meetingId}-${votingMotion._id}`);
                setHasVoted(false); // Revert optimistic update
                setSelectedVote(null);
                alert(data.message || 'Failed to submit vote');
                return;
            }

            // Show results if voting is complete
            if (data.votingComplete && data.motion) {
                setVotingResults(data.motion);
                setShowVotingResults(true);
            }

            // Update UI with latest data
            fetchMeetingData();
        } catch (error) {
            // On error, revert the optimistic UI update and clear localStorage
            localStorage.removeItem(`voted-${meetingId}-${votingMotion._id}`);
            setHasVoted(false); // Revert optimistic update
            setSelectedVote(null);
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote. Please try again.');
        }
    };

    if (notFound) {
        return (
            <div id="meeting-page-layout">
                <Taskbar />
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <h1>Meeting Not Found</h1>
                    <p>This meeting may have been deleted or does not exist.</p>
                    <button 
                        onClick={() => navigate('/home')} 
                        style={{ 
                            marginTop: '20px', 
                            padding: '10px 20px', 
                            fontSize: '1rem',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!meetingData) {
        return <div>Loading...</div>;
    }

    const currentMotion = meetingData.motionQueue[meetingData.currentMotionIndex];

    // If the user is NOT the meeting chairman (and not an admin), show the simplified member view
    if (!isChairman) {
        return (
            <div id="meeting-page-layout">
                {showVotingResults && votingResults && (
                    <VotingResults 
                        motion={votingResults} 
                        onClose={() => {
                            setShowVotingResults(false);
                            setVotingResults(null);
                            fetchMeetingData();
                        }}
                    />
                )}
                <Taskbar />
                <MemberView 
                    currentMotion={currentMotion}
                    votingMotion={votingMotion}
                    timeLeft={timeLeft}
                    isProposingMotion={isProposingMotion}
                    proposedMotion={proposedMotion}
                    handleVote={handleVote}
                    handleProposeMotion={handleProposeMotion}
                    setIsProposingMotion={setIsProposingMotion}
                    setProposedMotion={setProposedMotion}
                    hasVoted={hasVoted}
                    selectedVote={selectedVote}
                    setSelectedVote={setSelectedVote}
                />
            </div>
        );
    }

    // Chairman/Admin view
    return (
        <div id="meeting-page-layout">
            {showVotingResults && votingResults && (
                <VotingResults 
                    motion={votingResults} 
                    onClose={() => {
                        setShowVotingResults(false);
                        setVotingResults(null);
                        fetchMeetingData();
                    }}
                />
            )}
            {showPendingMotions && (
                <PendingMotionsReview
                    motions={meetingData.motionQueue
                        .map((motion, index) => ({ ...motion, index }))
                        .filter(motion => motion.status === 'pending')}
                    onReview={(pendingIndex, action) => {
                        // Find the actual index in the full motionQueue
                        const pendingMotions = meetingData.motionQueue
                            .map((motion, index) => ({ ...motion, index }))
                            .filter(motion => motion.status === 'pending');
                        const actualMotion = pendingMotions[pendingIndex];
                        if (actualMotion) {
                            handleMotionReview(actualMotion.index, action);
                        }
                    }}
                    onClose={() => setShowPendingMotions(false)}
                />
            )}
            <Taskbar />
            {/* End Meeting button moved to a fixed bottom-right position so it isn't inside the sidebar */}
            <div className="main-container">
                <AgendaSidebar
                    meetingData={meetingData}
                    isAgendaEditing={isAgendaEditing}
                    setIsAgendaEditing={setIsAgendaEditing}
                    handleAgendaNav={handleAgendaNav}
                    saveData={saveData}
                />
                <CenterContent
                    currentMotion={currentMotion}
                    timeLeft={timeLeft}
                    handleStartVote={handleStartVote}
                    meetingData={meetingData}
                />
                <MotionQueueSidebar
                    // Pass the full meetingData so save/update operations don't accidentally
                    // remove pending motions. The sidebar can choose to hide pending
                    // motions in its UI rendering when `hidePending` is true.
                    meetingData={meetingData}
                    hidePending={true}
                    isMotionQueueEditing={isMotionQueueEditing}
                    setIsMotionQueueEditing={setIsMotionQueueEditing}
                    newMotion={newMotion}
                    setNewMotion={setNewMotion}
                    handleAddMotionItem={handleAddMotionItem}
                    handleMotionNav={handleMotionNav}
                    saveData={saveData}
                    isChairman={isChairman}
                    showPendingMotions={showPendingMotions}
                    setShowPendingMotions={setShowPendingMotions}
                />
            {isChairman && (
                <button
                    className="end-meeting-fixed"
                    title="End Meeting and view minutes"
                    onClick={() => setShowEndConfirm(true)}
                >
                    End Meeting
                </button>
            )}
            {showEndConfirm && (
                <div className="confirm-modal-backdrop" onClick={() => setShowEndConfirm(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm End Meeting</h3>
                        <p>Are you sure you want to end the meeting? This will navigate everyone to the minutes page.</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button className="cancel-btn sidebar-btn" onClick={() => setShowEndConfirm(false)}>Cancel</button>
                            <button className="confirm-btn sidebar-btn" onClick={async () => { setShowEndConfirm(false); await handleEndMeeting(); }}>End Meeting</button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

// Export the component
export default MeetingPage;