import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../css/meeting_style.css'; // Your specific CSS file

const DraggableList = ({ items, onReorder, onRemove, renderItem, dataKeyPrefix }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        // Necessary for Firefox to allow dragging
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target);

        // Use a timeout to apply the 'dragging' class after the browser has created the drag image
        setTimeout(() => setDraggedIndex(index), 0);
    };

    const handleDragEnd = (e) => {
        setDraggedIndex(null);
        setOverIndex(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (index !== overIndex) {
            setOverIndex(index);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (draggedIndex === null || overIndex === null || draggedIndex === overIndex) {
            setDraggedIndex(null);
            setOverIndex(null);
            return;
        }

        const reorderedItems = [...items];
        const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(overIndex, 0, draggedItem);
        onReorder(reorderedItems);
        setDraggedIndex(null);
        setOverIndex(null);
    };

    return (
        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            {items.map((item, index) => {
                let transform = 'translateY(0)';
                if (draggedIndex !== null && overIndex !== null) {
                    if (draggedIndex < overIndex && index > draggedIndex && index <= overIndex) {
                        transform = 'translateY(-100%)'; // Move up
                    } else if (draggedIndex > overIndex && index < draggedIndex && index >= overIndex) {
                        transform = 'translateY(100%)'; // Move down
                    }
                }

                return (
                    <div key={index}
                         className={`agenda-item-edit ${draggedIndex === index ? 'dragging' : ''}`}
                         style={{ transform }}
                         draggable
                         onDragStart={(e) => handleDragStart(e, index)}
                         onDragEnd={handleDragEnd}
                         onDragOver={(e) => handleDragOver(e, index)}
                         data-key={`${dataKeyPrefix}-${index}`}>
                        {renderItem(item, index)}
                        <button className="remove-agenda-item-btn" onClick={() => onRemove(index)}>&times;</button>
                    </div>
                );
            })}
        </div>
    );
};

const MeetingPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const meetingStorageKey = `ronr-meetingData-${meetingId}`;

    const [meetingData, setMeetingData] = useState(null);
    const [isAgendaEditing, setIsAgendaEditing] = useState(false);
    const [isMotionQueueEditing, setIsMotionQueueEditing] = useState(false);
    const [newAgendaItem, setNewAgendaItem] = useState('');
    const [newMotion, setNewMotion] = useState({ name: '', description: '', creator: '' });

    const userRole = localStorage.getItem('currentUserRole');

    useEffect(() => {
        const fetchMeetingData = async () => {
            try {
                const response = await fetch(`http://localhost:5002/api/meetings/${meetingId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMeetingData(data);
            } catch (error) {
                console.error("Failed to fetch meeting data:", error);
                // Optionally, handle the error, e.g., navigate to an error page
            }
        };
        fetchMeetingData();
    }, [meetingId]);

    const saveData = async (newData) => {
        setMeetingData(newData);
        await fetch(`http://localhost:5002/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        const newIndex = meetingData.currentMotionIndex + direction;
        if (newIndex >= 0 && newIndex < meetingData.motionQueue.length) {
            saveData({ ...meetingData, currentMotionIndex: newIndex });
        }
    };

    const handleAddAgendaItem = () => {
        if (newAgendaItem.trim()) {
            const newData = { ...meetingData, agenda: [...meetingData.agenda, newAgendaItem.trim()] };
            saveData(newData);
            setNewAgendaItem('');
        }
    };

    const handleAddMotionItem = () => {
        if (newMotion.name.trim() && newMotion.creator.trim()) {
            const newData = { ...meetingData, motionQueue: [...meetingData.motionQueue, newMotion] };
            saveData(newData);
            setNewMotion({ name: '', description: '', creator: '' });
        }
    };



    if (!meetingData) {
        return <div>Loading...</div>;
    }

    const currentMotion = meetingData.motionQueue[meetingData.currentMotionIndex];

    return (
        // This wrapper provides a unique, high-specificity root for our CSS to target.
        <div id="meeting-page-layout">
            <div className="taskbar">
                <div className="taskbar-left">
                    <Link to="/home" className="taskbar-icon" title="Home">
                        <i className="bi-house"></i>
                    </Link>
                </div>
                <div className="taskbar-right">
                    <Link to="/profile" className="taskbar-icon" title="Profile">
                        <i className="bi-person"></i>
                    </Link>
                    <a href="#" onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }} className="taskbar-icon" title="Logout">
                        <i className="bi-box-arrow-right"></i>
                    </a>
                </div>
            </div>

            {/* This container defines the horizontal three-column layout and is vertically offset by CSS */}
            <div className="main-container">
                {/* Agenda Sidebar */}
                <div className="sidebar sidebar-left">
                    <h2>Agenda</h2>
                    <div id="agenda-container">
                        {isAgendaEditing ? (
                            <>
                                <DraggableList
                                    items={meetingData.agenda}
                                    onReorder={(reordered) => saveData({ ...meetingData, agenda: reordered })}
                                    onRemove={(index) => {
                                        const newAgenda = meetingData.agenda.filter((_, i) => i !== index);
                                        const newIndex = meetingData.currentAgendaIndex >= newAgenda.length 
                                            ? Math.max(0, newAgenda.length - 1) 
                                            : meetingData.currentAgendaIndex;
                                        saveData({ ...meetingData, agenda: newAgenda, currentAgendaIndex: newIndex });
                                    }}
                                    renderItem={(item, index) => <span>{`${index + 1}. ${item}`}</span>}
                                    dataKeyPrefix="agenda"
                                />
                                <input type="text" placeholder="New agenda item" value={newAgendaItem} onChange={(e) => setNewAgendaItem(e.target.value)} style={{ width: 'calc(100% - 10px)', marginTop: '10px' }} />
                                <button className="sidebar-btn" onClick={handleAddAgendaItem}>Add Item</button>
                                <button className="sidebar-btn" style={{ backgroundColor: '#2196F3' }} onClick={() => setIsAgendaEditing(false)}>Done Editing</button>
                            </>
                        ) : (
                            <>
                                {meetingData.agenda.map((item, index) => (
                                    <div key={index} className={`agenda-item ${index === meetingData.currentAgendaIndex ? 'active' : ''}`}>
                                        {`${index + 1}. ${item}`}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="sidebar-footer">
                        {!isAgendaEditing && (userRole === 'admin' || userRole === 'chairman') && (
                            <>
                                <div className="nav-buttons">
                                    <button className="sidebar-btn" onClick={() => handleAgendaNav(-1)}>Previous</button>
                                    <button className="sidebar-btn" onClick={() => handleAgendaNav(1)}>Next</button>
                                </div>
                                <button id="edit-agenda-btn" className="sidebar-btn" onClick={() => setIsAgendaEditing(true)}>Edit Agenda</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Center Content */}
                <div className="center-content">
                    <div className="current-motion-box">
                        <h3 id="motion-name">{currentMotion ? currentMotion.name : 'No Active Motion'}</h3>
                        <p id="motion-description">{currentMotion ? currentMotion.description : 'The motion queue is empty.'}</p>
                        {currentMotion && <p id="motion-creator" className="motion-creator-text">{`(Moved by: ${currentMotion.creator})`}</p>}
                    </div>
                </div>

                {/* Motion Queue Sidebar */}
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
                                    renderItem={(item) => <span>{item.name}</span>}
                                    dataKeyPrefix="motion"
                                />
                                <div style={{ marginTop: '15px' }}>
                                    <input type="text" placeholder="Motion Name" value={newMotion.name} onChange={(e) => setNewMotion({ ...newMotion, name: e.target.value })} style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }} />
                                    <textarea placeholder="Description" rows="2" value={newMotion.description} onChange={(e) => setNewMotion({ ...newMotion, description: e.target.value })} style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }}></textarea>
                                    <input type="text" placeholder="Moved by" value={newMotion.creator} onChange={(e) => setNewMotion({ ...newMotion, creator: e.target.value })} style={{ width: 'calc(100% - 10px)', marginBottom: '5px' }} />
                                </div>
                                <button className="sidebar-btn" onClick={handleAddMotionItem}>Add Motion</button>
                                <button className="sidebar-btn" style={{ backgroundColor: '#2196F3' }} onClick={() => setIsMotionQueueEditing(false)}>Done Editing</button>
                            </>
                        ) : (
                            <>
                                {meetingData.motionQueue.map((motion, index) => (
                                    <div key={index} className={`motion-item ${index === meetingData.currentMotionIndex ? 'active' : ''}`}>
                                        {`${index + 1}. ${motion.name}`}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="sidebar-footer">
                        {!isMotionQueueEditing && (userRole === 'admin' || userRole === 'chairman') && (
                            <>
                                {meetingData.motionQueue.length > 1 && (
                                    <div className="nav-buttons">
                                        <button className="sidebar-btn" onClick={() => handleMotionNav(-1)}>Previous</button>
                                        <button className="sidebar-btn" onClick={() => handleMotionNav(1)}>Next</button>
                                    </div>
                                )}
                                <button id="edit-motion-queue-btn" className="sidebar-btn" onClick={() => setIsMotionQueueEditing(true)}>Edit Motion Queue</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="footer">
                <button className="vote-button aye">AYE</button>
                <button className="vote-button no">NO</button>
                <button className="vote-button hand">
                    <i className="bi bi-hand-raised raise-hand-icon"></i>
                    Raise Hand
                </button>
            </div>
        </div>
    );
};

export default MeetingPage;