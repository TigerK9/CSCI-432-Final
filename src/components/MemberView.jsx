import React from 'react';

const MemberView = ({ currentMotion, votingMotion, timeLeft, isProposingMotion, proposedMotion, handleVote, handleProposeMotion, setIsProposingMotion, setProposedMotion, hasVoted, selectedVote, setSelectedVote }) => {
    // Don't show motions that are still pending approval by the chairman.
    const displayMotion = currentMotion && currentMotion.status !== 'pending' ? currentMotion : null;

    return (
        <div className="member-view">
            <div className="current-motion-box">
                <h3>{displayMotion ? displayMotion.name : 'No Active Motion'}</h3>
                <p>{displayMotion ? displayMotion.description : 'The motion queue is empty.'}</p>
                {displayMotion && <p className="motion-creator-text">{`(Moved by: ${displayMotion.creator})`}</p>}
                {votingMotion && (
                    <div className="voting-section">
                        <h4>Voting in Progress</h4>
                        <p>Time remaining: {Math.ceil(timeLeft / 1000)}s</p>
                        <div className="voting-buttons" data-vote-state={hasVoted ? 'voted' : 'voting'}>
                            <button
                                className={`vote-button aye${hasVoted && selectedVote === 'aye' ? ' selected-vote' : ''}`}
                                data-selected={hasVoted && selectedVote === 'aye'}
                                style={hasVoted && selectedVote === 'aye' ? { transform: 'scale(1.15) translateY(-6px)', zIndex: 1 } : {}}
                                onClick={() => {
                                    if (!hasVoted) {
                                        setSelectedVote('aye');
                                        handleVote('aye');
                                    }
                                }}
                                disabled={hasVoted}
                            >
                                AYE
                            </button>
                            <button
                                className={`vote-button no${hasVoted && selectedVote === 'no' ? ' selected-vote' : ''}`}
                                data-selected={hasVoted && selectedVote === 'no'}
                                style={hasVoted && selectedVote === 'no' ? { transform: 'scale(1.15) translateY(-6px)', zIndex: 1 } : {}}
                                onClick={() => {
                                    if (!hasVoted) {
                                        setSelectedVote('no');
                                        handleVote('no');
                                    }
                                }}
                                disabled={hasVoted}
                            >
                                NO
                            </button>
                            {hasVoted && <p className="voted-message">Vote recorded</p>}
                        </div>
                    {displayMotion && ['approved', 'failed', 'tied', 'no-votes', 'denied'].includes(displayMotion.status) && (
                        <div style={{ margin: '8px 0' }}>
                            <span className={`status-badge ${displayMotion.status}`}>{displayMotion.status.replace('-', ' ').replace(/(^|\s)\S/g, t => t.toUpperCase())}</span>
                        </div>
                    )}
                    </div>
                )}
            </div>

            <div className="member-controls">
                {!isProposingMotion ? (
                    <button 
                        className="vote-button hand"
                        onClick={() => setIsProposingMotion(true)}>
                        <i className="bi bi-hand-raised"></i>
                        Raise Hand
                    </button>
                ) : (
                    <div className="motion-proposal-form">
                        <input
                            type="text"
                            placeholder="Motion Title"
                            value={proposedMotion.name}
                            onChange={(e) => setProposedMotion(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <textarea
                            placeholder="Motion Description"
                            value={proposedMotion.description}
                            onChange={(e) => setProposedMotion(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="proposal-buttons">
                            <button onClick={handleProposeMotion}>Submit Motion</button>
                            <button onClick={() => setIsProposingMotion(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberView;
