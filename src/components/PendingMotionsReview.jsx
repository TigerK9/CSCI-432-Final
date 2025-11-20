import React, { useState } from 'react';
import '../css/meeting_style.css';

const PendingMotionsReview = ({ motions, onReview, onClose }) => {
    const [selectedMotion, setSelectedMotion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pendingMotions = motions.filter(motion => motion.status === 'pending');

    const handleReview = async (index, action) => {
        setLoading(true);
        setError(null);
        try {
            // Pass the index within the pending-motions list to the parent.
            // The parent (`MeetingPage`) expects the pending-list index and will
            // map it to the actual index in the full motionQueue.
            await onReview(index, action);
            setSelectedMotion(null);
            onClose();
        } catch (e) {
            setError('Failed to process motion. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pending-motions-overlay">
            <div className="pending-motions-modal">
                <div className="pending-motions-header">
                    <h2>Pending Motions Review</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="pending-motions-content">
                    <div className="pending-motions-list">
                        {pendingMotions.map((motion, index) => (
                            <div
                                key={index}
                                className={`pending-motion-item ${selectedMotion === index ? 'selected' : ''}`}
                                onClick={() => setSelectedMotion(index)}
                            >
                                <span className="motion-name">{motion.name}</span>
                                <span className="motion-creator">by {motion.creator}</span>
                            </div>
                        ))}
                        {pendingMotions.length === 0 && (
                            <div className="no-pending-motions">
                                No pending motions to review
                            </div>
                        )}
                    </div>
                    {selectedMotion !== null && (
                        <div className="motion-details">
                            <h3>{pendingMotions[selectedMotion].name}</h3>
                            <p><strong>Creator:</strong> {pendingMotions[selectedMotion].creator}</p>
                            <p><strong>Description:</strong></p>
                            <p className="motion-description">{pendingMotions[selectedMotion].description}</p>
                            {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
                            <div className="review-actions">
                                <button
                                    className="approve-button"
                                    onClick={() => handleReview(selectedMotion, 'approve')}
                                    disabled={loading}
                                >
                                    {loading ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                    className="deny-button"
                                    onClick={() => handleReview(selectedMotion, 'deny')}
                                    disabled={loading}
                                >
                                    {loading ? 'Denying...' : 'Deny'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingMotionsReview;