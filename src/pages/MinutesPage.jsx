import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Taskbar from '../components/Taskbar';
import '../css/minutes_style.css'; 

const MINUTES_STORAGE_KEY = 'ronr-minutesData';

const MinutesPage = () => {
    const { meetingId } = useParams();
    const [motions, setMotions] = useState([]);
    const [activeMotionId, setActiveMotionId] = useState(null);
    const [meetingTitle, setMeetingTitle] = useState('Q4 Session');

    useEffect(() => {
        const fetchMeetingMinutes = async () => {
            if (!meetingId) {
                setMotions(initialMotionData);
                setActiveMotionId(initialMotionData.length > 0 ? initialMotionData[0].id : null);
                return;
            }

            try {
                const res = await fetch(`http://localhost:5002/api/meetings/${meetingId}`);
                if (!res.ok) throw new Error('Failed to fetch meeting');
                const data = await res.json();

                // Map meeting.motionQueue to the minutes format
                const mq = Array.isArray(data.motionQueue) ? data.motionQueue : [];
                const mapped = mq.map((m, idx) => ({
                    id: idx + 1,
                    title: m.name || `Motion ${idx + 1}`,
                    result: m.result ? (
                        m.result === 'approved' ? 'Passed' : (m.result === 'failed' ? 'Failed' : (m.result === 'tied' ? 'Tied' : (m.result === 'no-votes' ? 'No Votes' : m.result)))
                    ) : (m.status === 'denied' ? 'Denied' : (m.status === 'proposed' ? 'Proposed' : m.status || '')),
                    description: m.description || '',
                    voting_results: {
                        yes: (m.votes && typeof m.votes.aye === 'number') ? m.votes.aye : ((m.votes && m.votes.aye) ? m.votes.aye : 0),
                        no: (m.votes && typeof m.votes.no === 'number') ? m.votes.no : ((m.votes && m.votes.no) ? m.votes.no : 0),
                        abstain: (m.votes && typeof m.votes.abstain === 'number') ? m.votes.abstain : 0,
                    },
                    chair_summary: m.reviewedBy ? `Reviewed by ${m.reviewedBy}${m.reviewedAt ? ` on ${new Date(m.reviewedAt).toLocaleString()}` : ''}` : '',
                }));

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

    const activeMotion = motions.find(m => m.id === activeMotionId);

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
                        <h2>Chronological Motion Index</h2>
                    </div>
                    <div id="motion-list-container" className="motion-list">
                        {motions.length > 0 ? motions.map(motion => (
                            <div key={motion.id} className={`motion-item ${motion.id === activeMotionId ? 'active' : ''}`} onClick={() => handleSelectMotion(motion.id)}>
                                <div className="motion-item-top">
                                    <div className="motion-badges">
                                        <span className={`result-badge ${motion.result.includes('Passed') ? 'passed' : 'failed'}`}>{motion.result}</span>
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
                                <span className={`meta-badge ${activeMotion.result.includes('Passed') ? 'passed' : 'failed'}`}>{activeMotion.result}</span>
                            </div>
                            <h3 className="section-title">Motion Description</h3>
                            <p className="motion-description">{activeMotion.description}</p>
                            <h3 className="section-title">Voting Results</h3>
                            <div className="voting-grid">
                                <div className="vote-card yes"><p className="vote-number">{activeMotion.voting_results.yes}</p><p className="vote-label">Yes</p></div>
                                <div className="vote-card no"><p className="vote-number">{activeMotion.voting_results.no}</p><p className="vote-label">No</p></div>
                                <div className="vote-card abstain"><p className="vote-number">{activeMotion.voting_results.abstain}</p><p className="vote-label">Abstain</p></div>
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