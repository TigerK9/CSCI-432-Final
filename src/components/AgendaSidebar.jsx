import React, { useState, useEffect, useRef } from 'react';
import DraggableList from './DraggableList';

const AgendaSidebar = ({
    meetingData,
    isAgendaEditing,
    setIsAgendaEditing,
    handleAgendaNav,
    saveData
}) => {
    // Local editable state used only while in edit mode. This allows canceling
    // without persisting intermediate changes.
    const [localAgenda, setLocalAgenda] = useState([]);
    const [localNewItem, setLocalNewItem] = useState('');

    // Initialize local state once when edit mode is entered. We use a ref so
    // that subsequent incoming updates to `meetingData` (from polling) won't
    // reset the user's in-progress edits.
    const initRef = useRef(false);
    useEffect(() => {
        if (isAgendaEditing && !initRef.current) {
            setLocalAgenda([...(meetingData.agenda || [])]);
            setLocalNewItem('');
            initRef.current = true;
        }
        // When exiting edit mode, allow initialization again next time
        if (!isAgendaEditing) initRef.current = false;
    }, [isAgendaEditing]);

    const handleLocalReorder = (reordered) => setLocalAgenda(reordered);
    const handleLocalRemove = (index) => setLocalAgenda(prev => prev.filter((_, i) => i !== index));
    const handleLocalAdd = () => {
        if (!localNewItem.trim()) return;
        setLocalAgenda(prev => [...prev, localNewItem.trim()]);
        setLocalNewItem('');
    };

    const handleSave = () => {
        const newIndex = meetingData.currentAgendaIndex >= localAgenda.length
            ? Math.max(0, localAgenda.length - 1)
            : meetingData.currentAgendaIndex;
        saveData({ ...meetingData, agenda: localAgenda, currentAgendaIndex: newIndex });
        setIsAgendaEditing(false);
        initRef.current = false;
    };

    const handleCancel = () => {
        // Discard local changes and exit edit mode
        setLocalAgenda([]);
        setLocalNewItem('');
        setIsAgendaEditing(false);
        initRef.current = false;
    };

    return (
        <div className="sidebar sidebar-left">
            <h2>Agenda</h2>
            <div id="agenda-container">
                {isAgendaEditing ? (
                    <>
                        <DraggableList
                            items={localAgenda}
                            onReorder={handleLocalReorder}
                            onRemove={handleLocalRemove}
                            renderItem={(item, index) => <span>{`${index + 1}. ${item}`}</span>}
                            dataKeyPrefix="agenda"
                        />
                        <input 
                            type="text" 
                            placeholder="New agenda item" 
                            value={localNewItem} 
                            onChange={(e) => setLocalNewItem(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleLocalAdd()}
                            style={{ width: 'calc(100% - 10px)', marginTop: '10px' }} 
                        />
                        <button className="sidebar-btn" onClick={handleLocalAdd}>Add Item</button>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                            <button
                                className="sidebar-btn"
                                style={{ backgroundColor: '#2196F3', padding: '6px 10px', fontSize: '0.9rem', minWidth: '90px' }}
                                onClick={handleSave}
                            >
                                Save Changes
                            </button>
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
                        {meetingData.agenda.map((item, index) => (
                            <div key={index} className={`agenda-item ${index === meetingData.currentAgendaIndex ? 'active' : ''}`}>
                                {`${index + 1}. ${item}`}
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="sidebar-footer">
                {!isAgendaEditing && (
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
    );
};

export default AgendaSidebar;
