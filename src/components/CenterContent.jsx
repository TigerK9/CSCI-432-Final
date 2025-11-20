import React from 'react';

const CenterContent = ({ currentMotion, timeLeft, handleStartVote, meetingData }) => {
    // Only show a motion in center if it's not pending (i.e., approved/proposed/etc.).
    const displayMotion = currentMotion && currentMotion.status !== 'pending' ? currentMotion : null;

    return (
    <div className="center-content">
        <div className="current-motion-box">
            <h3 id="motion-name">{displayMotion ? displayMotion.name : 'No Active Motion'}</h3>
            <p id="motion-description">{displayMotion ? displayMotion.description : 'The motion queue is empty.'}</p>
            {displayMotion && (
                <>
                    <p id="motion-creator" className="motion-creator-text">{`(Moved by: ${displayMotion.creator})`}</p>
                    {displayMotion.status === 'proposed' && (
                        <button 
                            className="start-vote-btn"
                            onClick={() => handleStartVote(meetingData.currentMotionIndex)}
                        >
                            Start Voting
                        </button>
                    )}
                    {displayMotion.status === 'voting' && (
                        <div className="voting-status">
                            <h4>Voting in Progress</h4>
                            <p>Time remaining: {Math.ceil(timeLeft / 1000)}s</p>
                            <div className="vote-counts">
                                <p>Aye: {displayMotion.votes.aye}</p>
                                <p>No: {displayMotion.votes.no}</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
    );
};

export default CenterContent;
