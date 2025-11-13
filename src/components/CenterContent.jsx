import React from 'react';

const CenterContent = ({ currentMotion, timeLeft, handleStartVote, meetingData }) => (
    <div className="center-content">
        <div className="current-motion-box">
            <h3 id="motion-name">{currentMotion ? currentMotion.name : 'No Active Motion'}</h3>
            <p id="motion-description">{currentMotion ? currentMotion.description : 'The motion queue is empty.'}</p>
            {currentMotion && (
                <>
                    <p id="motion-creator" className="motion-creator-text">{`(Moved by: ${currentMotion.creator})`}</p>
                    {currentMotion.status === 'proposed' && (
                        <button 
                            className="start-vote-btn"
                            onClick={() => handleStartVote(meetingData.currentMotionIndex)}
                        >
                            Start Voting
                        </button>
                    )}
                    {currentMotion.status === 'voting' && (
                        <div className="voting-status">
                            <h4>Voting in Progress</h4>
                            <p>Time remaining: {Math.ceil(timeLeft / 1000)}s</p>
                            <div className="vote-counts">
                                <p>Aye: {currentMotion.votes.aye}</p>
                                <p>No: {currentMotion.votes.no}</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
);

export default CenterContent;
