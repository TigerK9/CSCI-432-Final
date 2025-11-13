import React, { useState } from 'react';

const DraggableList = ({ items, onReorder, onRemove, renderItem, dataKeyPrefix }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target);
        setTimeout(() => setDraggedIndex(index), 0);
    };

    const handleDragEnd = () => {
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
                        transform = 'translateY(-100%)';
                    } else if (draggedIndex > overIndex && index < draggedIndex && index >= overIndex) {
                        transform = 'translateY(100%)';
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

export default DraggableList;
