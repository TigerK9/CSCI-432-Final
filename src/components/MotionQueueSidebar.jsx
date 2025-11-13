import React from 'react';
import DraggableList from './DraggableList';

const MotionQueueSidebar = ({
    meetingData,
    isMotionQueueEditing,
    setIsMotionQueueEditing,
    newMotion,
    setNewMotion,
    handleAddMotionItem,
    handleMotionNav,
    saveData,
    isChairman,
    showPendingMotions,
    setShowPendingMotions
}) => (
    <div className="sidebar sidebar-right">
        <h2>Motion Queue</h2>
        <div id="motion-queue-container">
            {isMotionQueueEditing ? (
                <>
                    <DraggableList
                        items={meetingData.motionQueue}
                        onReorder={(reordered) => saveData({ ...meetingData, motionQueue: reordered })}
                        onRemove={(index) => {
                            const newQueue = meetingData.motionQueue.filter((_, i) => i !== index);
                            const newIndex = meetingData.currentMotionIndex >= newQueue.length
                                ? Math.max(0, newQueue.length - 1)
                                : meetingData.currentMotionIndex;
                            saveData({ ...meetingData, motionQueue: newQueue, currentMotionIndex: newIndex });
                        }}
                        renderItem={(item) => (
                            <span>
                                {item.name}
                                {item.status === 'pending' && ' (New)'}
                            </span>
                        )}
                        dataKeyPrefix="motion"
                    />
                    <div style={{ marginTop: '15px' }}>
                        <input 
                            type="text" 
                            placeholder="Motion Name" 
                            value={newMotion.name} 
                            onChange={(e) => setNewMotion({ ...newMotion, name: e.target.value })} 
                            style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }} 
                        />
                        <textarea 
                            placeholder="Description" 
                            rows="2" 
                            value={newMotion.description} 
                            onChange={(e) => setNewMotion({ ...newMotion, description: e.target.value })} 
                            style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Moved by" 
                            value={newMotion.creator} 
                            onChange={(e) => setNewMotion({ ...newMotion, creator: e.target.value })} 
                            style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }} 
                        />
                    </div>
                    <button className="sidebar-btn" onClick={handleAddMotionItem}>Add Motion</button>
                    <button 
                        className="sidebar-btn" 
                        style={{ backgroundColor: '#2196F3' }} 
                        onClick={() => setIsMotionQueueEditing(false)}
                    >
                        Done Editing
                    </button>
                </>
            ) : (
                <>
                    {meetingData.motionQueue
                        .filter(motion => motion.status !== 'pending')
                        .map((motion, index) => (
                            <div 
                                key={index} 
                                className={`motion-item ${index === meetingData.currentMotionIndex ? 'active' : ''}`}
                            >
                                {`${index + 1}. ${motion.name}`}
                                <span className={`status-badge ${motion.status}`}>
                                    {motion.status.charAt(0).toUpperCase() + motion.status.slice(1)}
                                </span>
                            </div>
                        ))}
                </>
            )}
        </div>
        <div className="sidebar-footer">
            {!isMotionQueueEditing && (
                <>
                    {meetingData.motionQueue.length > 1 && (
                        <div className="nav-buttons">
                            <button className="sidebar-btn" onClick={() => handleMotionNav(-1)}>Previous</button>
                            <button className="sidebar-btn" onClick={() => handleMotionNav(1)}>Next</button>
                        </div>
                    )}
                    <button 
                        id="edit-motion-queue-btn" 
                        className="sidebar-btn" 
                        onClick={() => setIsMotionQueueEditing(true)}
                    >
                        Edit Motion Queue
                    </button>
                    {isChairman && (
                        <button 
                            id="review-pending-motions-btn" 
                            className="sidebar-btn chairman-btn" 
                            onClick={() => setShowPendingMotions(true)}
                        >
                            Review Pending Motions 
                            {meetingData.motionQueue.filter(m => m.status === 'pending').length > 0 && 
                                <span className="pending-count">
                                    ({meetingData.motionQueue.filter(m => m.status === 'pending').length})
                                </span>
                            }
                        </button>
                    )}
                </>
            )}
        </div>
    </div>
);

export default MotionQueueSidebar;
