import React, { useState, useEffect, useRef } from 'react';
import DraggableList from './DraggableList';
import '../css/motion_queue.css';

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
    hidePending,
    showPendingMotions,
    setShowPendingMotions
}) => {
    // Local editable state used only while in edit mode. This allows canceling
    // without persisting intermediate changes.
    const [localVisible, setLocalVisible] = useState([]);
    const [localNewMotion, setLocalNewMotion] = useState({ name: '', description: '', creator: '' });

    // Initialize localEditable state once when edit mode is entered. We use a
    // ref so that subsequent incoming updates to `meetingData` (from polling)
    // won't reset the user's in-progress edits.
    const initRef = useRef(false);
    useEffect(() => {
        if (isMotionQueueEditing && !initRef.current) {
            const fullList = (meetingData && meetingData.motionQueue) ? meetingData.motionQueue : [];
            const visible = hidePending ? fullList.filter(m => m.status !== 'pending') : [...fullList];
            // Make a shallow copy for local edits
            setLocalVisible(visible.map(m => ({ ...m })));
            setLocalNewMotion({ name: '', description: '', creator: '' });
            initRef.current = true;
        }
        // When exiting edit mode, allow initialization again next time
        if (!isMotionQueueEditing) initRef.current = false;
    }, [isMotionQueueEditing]);

    const handleLocalReorder = (reordered) => setLocalVisible(reordered);
    const handleLocalRemove = (index) => setLocalVisible(prev => prev.filter((_, i) => i !== index));
    const handleLocalAdd = () => {
        if (!localNewMotion.name.trim()) return;
        setLocalVisible(prev => [...prev, { ...localNewMotion }]);
        setLocalNewMotion({ name: '', description: '', creator: '' });
    };

    const handleSave = () => {
        const fullList = (meetingData && meetingData.motionQueue) ? meetingData.motionQueue : [];
        const pendingMotions = fullList.filter(m => m.status === 'pending');
        const merged = hidePending ? [...localVisible, ...pendingMotions] : [...localVisible];
        const newIndex = meetingData.currentMotionIndex >= merged.length
            ? Math.max(0, merged.length - 1)
            : meetingData.currentMotionIndex;
        saveData({ ...meetingData, motionQueue: merged, currentMotionIndex: newIndex });
        setIsMotionQueueEditing(false);
        initRef.current = false;
    };

    const handleCancel = () => {
        // Discard local changes and exit edit mode
        setLocalVisible([]);
        setLocalNewMotion({ name: '', description: '', creator: '' });
        setIsMotionQueueEditing(false);
        initRef.current = false;
    };

    // Render
    const fullList = (meetingData && meetingData.motionQueue) ? meetingData.motionQueue : [];
    const visibleWithFullIndex = hidePending
        ? fullList.map((m, i) => ({ motion: m, fullIndex: i })).filter(x => x.motion.status !== 'pending')
        : fullList.map((m, i) => ({ motion: m, fullIndex: i }));

    return (
        <div className="sidebar sidebar-right motion-queue-sidebar">
            <h2>Motion Queue</h2>
            <div id="motion-queue-container">
                {isMotionQueueEditing ? (
                    <>
                        <DraggableList
                            items={localVisible}
                            onReorder={handleLocalReorder}
                            onRemove={handleLocalRemove}
                            renderItem={(item) => (
                                <span>{item.name}</span>
                            )}
                            dataKeyPrefix="motion"
                        />
                        {/* Only non-chairman users may add motions manually here. Chairmen should use 'Propose Motion' flow. */}
                        {!isChairman && (
                            <>
                                <div style={{ marginTop: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Motion Name"
                                        value={localNewMotion.name}
                                        onChange={(e) => setLocalNewMotion({ ...localNewMotion, name: e.target.value })}
                                        style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }}
                                    />
                                    <textarea
                                        placeholder="Description"
                                        rows="2"
                                        value={localNewMotion.description}
                                        onChange={(e) => setLocalNewMotion({ ...localNewMotion, description: e.target.value })}
                                        style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Moved by"
                                        value={localNewMotion.creator}
                                        onChange={(e) => setLocalNewMotion({ ...localNewMotion, creator: e.target.value })}
                                        style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }}
                                    />
                                </div>
                                <button className="sidebar-btn" onClick={handleLocalAdd}>Add Motion</button>
                            </>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                            <button
                                className="sidebar-btn"
                                style={{ backgroundColor: '#2196F3', padding: '6px 10px', fontSize: '0.9rem', minWidth: '90px' }}
                                onClick={handleSave}
                            >
                                Save Changes
                            </button>
                            {/* Show Cancel for chairmen as requested (and for everyone else it'll be available too) */}
                            <button
                                className="sidebar-btn"
                                style={{ backgroundColor: '#f44336', padding: '6px 10px', fontSize: '0.9rem', minWidth: '90px' }}
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {visibleWithFullIndex.map((x, idx) => {
                            // Prefer a recorded result if present (for legacy documents that
                            // still have status 'completed' but a 'result' field).
                            const statusKey = x.motion.result || x.motion.status || '';
                            const statusLabel = statusKey
                                ? statusKey.replace('-', ' ').replace(/(^|\s)\S/g, t => t.toUpperCase())
                                : '';
                            return (
                                <div 
                                    key={x.fullIndex} 
                                    className={`motion-item ${x.fullIndex === meetingData.currentMotionIndex ? 'active' : ''}`}
                                >
                                    {`${idx + 1}. ${x.motion.name}`}
                                    {statusKey && (
                                        <span className={`status-badge ${statusKey}`}>
                                            {statusLabel}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
            <div className="sidebar-footer">
                {!isMotionQueueEditing && (
                    <>
                        {((hidePending)
                            ? meetingData.motionQueue.filter(m => m.status !== 'pending').length > 1
                            : meetingData.motionQueue.length > 1
                        ) && (
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
};

export default MotionQueueSidebar;
