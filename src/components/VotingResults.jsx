import React, { useEffect, useCallback } from 'react';
import '../css/voting_results.css';

const VotingResults = ({ motion, onClose }) => {
    const totalVotes = motion.votes.aye + motion.votes.no;
    const ayePercentage = totalVotes > 0 ? Math.round((motion.votes.aye / totalVotes) * 100) : 0;
    const noPercentage = totalVotes > 0 ? Math.round((motion.votes.no / totalVotes) * 100) : 0;

    // Handle escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Handle click outside
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('voting-results-overlay')) {
            onClose();
        }
    };

    return (
        <div className="voting-results-overlay" onClick={handleOverlayClick}>
            <div className="voting-results-modal">
                <button className="voting-results-close-btn" onClick={onClose}>&times;</button>
                <h2>Voting Results</h2>
                <h3 className="motion-title">{motion.name}</h3>
                
                <div className="result-status">
                    <span className={`result-badge ${motion.result}`}>
                        {motion.result === 'approved' && 'Motion Approved'}
                        {motion.result === 'failed' && 'Motion Failed'}
                        {motion.result === 'tie' && 'Motion Tied'}
                        {motion.result === 'no-votes' && 'No Votes Cast'}
                    </span>
                </div>

                <div className="vote-bars">
                    <div className="vote-bar">
                        <div className="bar-label">Aye ({motion.votes.aye})</div>
                        <div className="bar-container">
                            <div 
                                className="bar aye" 
                                style={{ width: `${ayePercentage}%` }}
                            ></div>
                            <span className="percentage">{ayePercentage}%</span>
                        </div>
                    </div>
                    <div className="vote-bar">
                        <div className="bar-label">No ({motion.votes.no})</div>
                        <div className="bar-container">
                            <div 
                                className="bar no" 
                                style={{ width: `${noPercentage}%` }}
                            ></div>
                            <span className="percentage">{noPercentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="total-votes">
                    Total Votes: {totalVotes}
                </div>
            </div>
        </div>
    );
};

export default VotingResults;