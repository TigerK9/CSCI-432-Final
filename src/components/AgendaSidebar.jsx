import React from 'react';
import DraggableList from './DraggableList';

const AgendaSidebar = ({
    meetingData,
    isAgendaEditing,
    setIsAgendaEditing,
    newAgendaItem,
    setNewAgendaItem,
    handleAddAgendaItem,
    handleAgendaNav,
    saveData
}) => (
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

export default AgendaSidebar;
