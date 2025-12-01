import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Taskbar from '../components/Taskbar';
import '../css/minutes_style.css'; 

const MINUTES_STORAGE_KEY = 'ronr-minutesData';

const MinutesPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const [motions, setMotions] = useState([]);
    const [activeMotionId, setActiveMotionId] = useState(null);
    const [meetingTitle, setMeetingTitle] = useState('Q4 Session');
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchMeetingMinutes = async () => {
            if (!meetingId) {
                setMotions(initialMotionData);
                setActiveMotionId(initialMotionData.length > 0 ? initialMotionData[0].id : null);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5002/api/meetings/${meetingId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                
                if (res.status === 403) {
                    alert('You are not authorized to view these minutes.');
                    navigate('/home');
                    return;
                }
                
                if (!res.ok) throw new Error('Failed to fetch meeting');
                const data = await res.json();

                // Map meeting.motionQueue to the minutes format
                const mq = Array.isArray(data.motionQueue) ? data.motionQueue : [];
                const mapped = mq.map((m, idx) => {
                    // Determine the display result based on status
                    let displayResult = '';
                    switch (m.status) {
                        case 'approved':
                            displayResult = 'Passed';
                            break;
                        case 'completed':
                            displayResult = 'Passed';
                            break;
                        case 'failed':
                            displayResult = 'Failed';
                            break;
                        case 'tied':
                            displayResult = 'Tied';
                            break;
                        case 'no-votes':
                            displayResult = 'No Votes';
                            break;
                        case 'denied':
                            displayResult = 'Denied';
                            break;
                        case 'proposed':
                            displayResult = 'Proposed';
                            break;
                        case 'pending':
                            displayResult = 'Pending';
                            break;
                        case 'active':
                        case 'voting':
                            displayResult = 'In Progress';
                            break;
                        default:
                            displayResult = m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : 'Unknown';
                    }

                    return {
                        id: idx + 1,
                        title: m.name || `Motion ${idx + 1}`,
                        result: displayResult,
                        description: m.description || '',
                        voting_results: {
                            aye: (m.votes && typeof m.votes.aye === 'number') ? m.votes.aye : ((m.votes && m.votes.aye) ? m.votes.aye : 0),
                            no: (m.votes && typeof m.votes.no === 'number') ? m.votes.no : ((m.votes && m.votes.no) ? m.votes.no : 0),
                        },
                        chair_summary: m.reviewedBy ? `Reviewed by ${m.reviewedBy}${m.reviewedAt ? ` on ${new Date(m.reviewedAt).toLocaleString()}` : ''}` : '',
                    };
                });

                if (mapped.length === 0) {
                    setMotions(initialMotionData);
                    setActiveMotionId(initialMotionData.length > 0 ? initialMotionData[0].id : null);
                } else {
                    setMotions(mapped);
                    setActiveMotionId(mapped[0].id);
                }

                // Use meeting title from server when available
                if (data && (data.title || data.name)) {
                    setMeetingTitle(data.title || data.name);
                }
            } catch (e) {
                console.error('Failed to load meeting minutes:', e);
                setMotions(initialMotionData);
                setActiveMotionId(initialMotionData.length > 0 ? initialMotionData[0].id : null);
                setMeetingTitle('Q4 Session');
            }
        };

        fetchMeetingMinutes();
    }, [meetingId]);

    useEffect(() => {
        if (activeMotionId !== null) {
            localStorage.setItem(MINUTES_STORAGE_KEY, JSON.stringify({ motions, activeId: activeMotionId }));
        }
    }, [activeMotionId, motions]);

    const handleSelectMotion = (id) => {
        setActiveMotionId(id);
    };

    const getResultClass = (result) => {
        const lower = result.toLowerCase();
        if (lower === 'passed') return 'passed';
        if (lower === 'failed') return 'failed';
        if (lower === 'tied') return 'tied';
        return 'default'; // proposed, pending, denied, in progress, etc.
    };

    const activeMotion = motions.find(m => m.id === activeMotionId);

    if (notFound) {
        return (
            <div className="minutes-page">
                <Taskbar />
                <div className="page-content">
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
            </div>
        );
    }

    return (
        <div className="minutes-page">
            <Taskbar />
                <div className="page-content">
                    <header className="page-header">
                        <div className="container header-card">
                            <h1>{meetingTitle} Minutes</h1>
                        </div>
                    </header>

                    <div className="main-grid">
                <aside className="minutes-sidebar">
                    <div className="minutes-sidebar-header">
                        <h2>Motion Index</h2>
                    </div>
                    <div id="motion-list-container" className="motion-list">
                        {motions.length > 0 ? motions.map(motion => (
                            <div key={motion.id} className={`motion-item ${motion.id === activeMotionId ? 'active' : ''}`} onClick={() => handleSelectMotion(motion.id)}>
                                <div className="motion-item-top">
                                    <div className="motion-badges">
                                        <span className={`result-badge ${getResultClass(motion.result)}`}>{motion.result}</span>
                                    </div>
                                </div>
                                <h3 className="motion-title">{motion.title}</h3>
                            </div>
                        )) : <p className="loading-text">Loading motions...</p>}
                    </div>
                </aside>
                <main id="motion-details" className="minutes-details-panel">
                    {activeMotion ? (
                        <div className="details-inner">
                            <h2 className="motion-page-title">{activeMotion.title}</h2>
                            <div className="motion-meta">
                                <span className={`meta-badge ${getResultClass(activeMotion.result)}`}>{activeMotion.result}</span>
                            </div>
                            <h3 className="section-title">Motion Description</h3>
                            <p className="motion-description">{activeMotion.description}</p>
                            <h3 className="section-title">Voting Results</h3>
                            <div className="voting-grid">
                                <div className="vote-card aye"><p className="vote-number">{activeMotion.voting_results.aye}</p><p className="vote-label">Aye</p></div>
                                <div className="vote-card no"><p className="vote-number">{activeMotion.voting_results.no}</p><p className="vote-label">No</p></div>
                            </div>
                            {activeMotion.chair_summary && <>
                                <h3 className="section-title">Chair's Summary</h3>
                                <div className="chair-summary"><p className="chair-text">{activeMotion.chair_summary}</p></div>
                            </>}
                        </div>
                    ) : <p className="no-selection">Select a motion from the index to view its full details, voting record, and the Chair's summary.</p>}
                </main>
                    </div>
            </div>
        </div>
    );
};

export default MinutesPage;