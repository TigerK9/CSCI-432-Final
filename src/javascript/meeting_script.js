const MEETING_STORAGE_KEY = 'ronr-meetingData';

// This variable will hold the meeting data, loaded from localStorage or initial data.
let meetingData = {};

// The initial/default data for a meeting.
const initialMeetingData = {
    // The index of the currently active agenda item.
    currentAgendaIndex: 0,
    // The index of the currently active motion item.
    currentMotionIndex: 0,
    // Agenda data: an array of strings.
    agenda: [
        "Call to order",
        "Approval of previous minutes",
        "Report from the Finance Committee",
        "New Business"
    ],

    // Motion queue data: an array of objects.
    motionQueue: [
        {
            name: "Approve new budget for Q3",
            description: `"I move to approve the new budget for the third quarter of this fiscal year."`,
            creator: "Jane Doe"
        },
        { name: "Table the discussion", description: "To postpone the current discussion.", creator: "John Smith" },
        { name: "Amend the previous motion", description: "To make a change to the budget motion.", creator: "Emily White" },
        { name: "End the debate", description: "To call for an immediate vote.", creator: "David Green" }
    ]
};

/**
 * Loads meeting data from local storage.
 * @returns {object | null} The parsed meeting data or null if not found.
 */
function loadMeetingDataFromStorage() {
  const storedData = localStorage.getItem(MEETING_STORAGE_KEY);
  try {
    return storedData ? JSON.parse(storedData) : null;
  } catch (e) {
    console.error("Error parsing meeting data from localStorage", e);
    return null;
  }
}

/**
 * Saves the current meeting data to local storage.
 * @param {object} data The meeting data object to save.
 */
function saveMeetingDataToStorage(data) {
  localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(data));
}

// --- State for Agenda Editing ---
let isAgendaEditing = false;
// --- State for Motion Queue Editing ---
let isMotionQueueEditing = false;

// Function to update the HTML content based on the meetingData variable.
function updateMeetingUI() {
    if (!meetingData) return;
    // --- Update the Current Motion section ---
    const motionNameEl = document.getElementById('motion-name');
    const motionDescriptionEl = document.getElementById('motion-description');
    const motionCreatorEl = document.getElementById('motion-creator');

    const currentMotion = meetingData.motionQueue && meetingData.motionQueue[meetingData.currentMotionIndex];

    if (currentMotion) {
        // Populate the elements with data from the first item in the motion queue.
        motionNameEl.textContent = `Current Motion: ${currentMotion.name}`;
        motionDescriptionEl.textContent = currentMotion.description;
        motionCreatorEl.textContent = `(Moved by: ${currentMotion.creator})`;
    } else {
        motionNameEl.textContent = 'No Active Motion';
        motionDescriptionEl.textContent = 'The motion queue is empty.';
        motionCreatorEl.textContent = '';
    }

    // --- Update the Agenda section ---
    const agendaContainer = document.getElementById('agenda-container');
    const agendaSidebar = agendaContainer.parentElement;
    // Clear any existing content in the container.
    while (agendaSidebar.lastChild && agendaSidebar.lastChild !== agendaContainer) {
        agendaSidebar.removeChild(agendaSidebar.lastChild);
    }
    agendaContainer.innerHTML = ''; // Clear the inner container as well
    
    if (isAgendaEditing) {
        // --- EDIT MODE ---
        meetingData.agenda.forEach((itemText, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'agenda-item-edit';
            itemContainer.draggable = true;
            itemContainer.dataset.index = index;

            const itemTextSpan = document.createElement('span');
            itemTextSpan.textContent = `${index + 1}. ${itemText}`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-agenda-item-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => {
                meetingData.agenda.splice(index, 1);
                updateMeetingUI(); // Re-render immediately
            };

            itemContainer.appendChild(itemTextSpan);
            itemContainer.appendChild(removeBtn);
            agendaContainer.appendChild(itemContainer);
        });

        // Add input for new items
        const addItemInput = document.createElement('input');
        addItemInput.type = 'text';
        addItemInput.placeholder = 'New agenda item';
        addItemInput.style.width = 'calc(100% - 10px)';
        addItemInput.style.marginTop = '10px';
        agendaContainer.appendChild(addItemInput);

        const addItemBtn = document.createElement('button');
        addItemBtn.textContent = 'Add Item';
        addItemBtn.className = 'sidebar-btn';
        addItemBtn.onclick = () => {
            if (addItemInput.value.trim()) {
                meetingData.agenda.push(addItemInput.value.trim());
                updateMeetingUI();
            }
        };
        agendaContainer.appendChild(addItemBtn);

        // Add Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Changes';
        saveBtn.className = 'sidebar-btn';
        saveBtn.style.backgroundColor = '#2196F3'; // Blue for save
        saveBtn.onclick = () => {
            isAgendaEditing = false;
            saveMeetingDataToStorage(meetingData);
            updateMeetingUI();
        };
        agendaContainer.appendChild(saveBtn);

            // --- Add Drag and Drop handlers only once when entering edit mode ---
            let draggedItemIndex = null;

            const removeDropIndicator = () => {
                const indicator = agendaContainer.querySelector('.drop-indicator');
                if (indicator) {
                    indicator.remove();
                }
                agendaContainer.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            };

            agendaContainer.addEventListener('dragend', e => {
                e.target.closest('.agenda-item-edit')?.classList.remove('dragging');
                draggedItemIndex = null;
                removeDropIndicator(); // Clean up indicator on drag end
            });
    } else {
        // --- VIEW MODE ---
        meetingData.agenda.forEach((itemText, index) => {
            const agendaItem = document.createElement('div');
            agendaItem.className = 'agenda-item';
            if (index === meetingData.currentAgendaIndex) {
                agendaItem.classList.add('active');
            }
            agendaItem.textContent = `${index + 1}. ${itemText}`;
            agendaContainer.appendChild(agendaItem);
        });

        // Add navigation buttons for the agenda
        const navContainer = document.createElement('div');
        navContainer.className = 'nav-buttons';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.className = 'sidebar-btn';
        prevBtn.onclick = () => {
            if (meetingData.currentAgendaIndex > 0) {
                meetingData.currentAgendaIndex--;
                saveMeetingDataToStorage(meetingData);
                updateMeetingUI();
            }
        };

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.className = 'sidebar-btn';
        nextBtn.onclick = () => {
            if (meetingData.currentAgendaIndex < meetingData.agenda.length - 1) {
                meetingData.currentAgendaIndex++;
                saveMeetingDataToStorage(meetingData);
                updateMeetingUI();
            }
        };

        navContainer.appendChild(prevBtn);
        navContainer.appendChild(nextBtn);
        agendaContainer.appendChild(navContainer);

        // Add Edit button
        const editBtn = document.createElement('button');
        editBtn.id = 'edit-agenda-btn';
        editBtn.className = 'sidebar-btn';
        editBtn.textContent = 'Edit Agenda';
        editBtn.onclick = () => {
            isAgendaEditing = true;
            updateMeetingUI();
        };
        agendaContainer.parentElement.appendChild(editBtn);
    }
    
    // --- Update the Motion Queue section ---
    const motionQueueContainer = document.getElementById('motion-queue-container');
    const motionQueueSidebar = motionQueueContainer.parentElement;
    while (motionQueueSidebar.lastChild && motionQueueSidebar.lastChild !== motionQueueContainer) {
        motionQueueSidebar.removeChild(motionQueueSidebar.lastChild);
    }
    motionQueueContainer.innerHTML = ''; // Clear the inner container as well

    if (isMotionQueueEditing) {
        // --- MOTION QUEUE EDIT MODE ---
        meetingData.motionQueue.forEach((motion, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'agenda-item-edit'; // Reuse agenda's edit style
            itemContainer.draggable = true;
            itemContainer.dataset.mqIndex = index; // Use mqIndex to avoid conflicts

            const itemTextSpan = document.createElement('span');
            itemTextSpan.textContent = motion.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-agenda-item-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => {
                meetingData.motionQueue.splice(index, 1);
                updateMeetingUI();
            };

            itemContainer.appendChild(itemTextSpan);
            itemContainer.appendChild(removeBtn);
            motionQueueContainer.appendChild(itemContainer);
        });

        // Add input form for new motions
        const formContainer = document.createElement('div');
        formContainer.style.marginTop = '15px';
        formContainer.innerHTML = `
            <input type="text" id="new-motion-name" placeholder="Motion Name" style="width: calc(100% - 10px); margin-bottom: 5px;">
            <textarea id="new-motion-desc" placeholder="Description" rows="2" style="width: calc(100% - 10px); margin-bottom: 5px;"></textarea>
            <input type="text" id="new-motion-creator" placeholder="Moved by" style="width: calc(100% - 10px); margin-bottom: 5px;">
        `;
        motionQueueContainer.appendChild(formContainer);

        const addItemBtn = document.createElement('button');
        addItemBtn.textContent = 'Add Motion';
        addItemBtn.className = 'sidebar-btn';
        addItemBtn.onclick = () => {
            const name = document.getElementById('new-motion-name').value.trim();
            const description = document.getElementById('new-motion-desc').value.trim();
            const creator = document.getElementById('new-motion-creator').value.trim();
            if (name && creator) {
                meetingData.motionQueue.push({ name, description, creator });
                updateMeetingUI();
            }
        };
        motionQueueContainer.appendChild(addItemBtn);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Changes';
        saveBtn.className = 'sidebar-btn';
        saveBtn.style.backgroundColor = '#2196F3';
        saveBtn.onclick = () => {
            isMotionQueueEditing = false;
            saveMeetingDataToStorage(meetingData);
            updateMeetingUI();
        };
        motionQueueContainer.appendChild(saveBtn);

    } else {
        // --- MOTION QUEUE VIEW MODE ---
        meetingData.motionQueue.forEach((motion, index) => {
            const motionItem = document.createElement('div');
            motionItem.className = 'motion-item';
            // Highlight the first item (the current motion)
            if (index === meetingData.currentMotionIndex) {
                motionItem.classList.add('active');
            }
            motionItem.textContent = `${index + 1}. ${motion.name}`;
            motionQueueContainer.appendChild(motionItem);
        });

        // Add navigation buttons for the motion queue
        if (meetingData.motionQueue.length > 1) {
            const navContainer = document.createElement('div');
            navContainer.className = 'nav-buttons';

            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Previous';
            prevBtn.className = 'sidebar-btn';
            prevBtn.onclick = () => {
                if (meetingData.currentMotionIndex > 0) {
                    meetingData.currentMotionIndex--;
                    saveMeetingDataToStorage(meetingData);
                    updateMeetingUI();
                }
            };

            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.className = 'sidebar-btn';
            nextBtn.onclick = () => {
                if (meetingData.currentMotionIndex < meetingData.motionQueue.length - 1) {
                    meetingData.currentMotionIndex++;
                    saveMeetingDataToStorage(meetingData);
                    updateMeetingUI();
                }
            };

            navContainer.appendChild(prevBtn);
            navContainer.appendChild(nextBtn);
            motionQueueContainer.appendChild(navContainer);
        }

        const editBtn = document.createElement('button');
        editBtn.id = 'edit-motion-queue-btn';
        editBtn.className = 'sidebar-btn';
        editBtn.textContent = 'Edit Motion Queue';
        editBtn.onclick = () => {
            isMotionQueueEditing = true;
            updateMeetingUI();
        };
        motionQueueContainer.parentElement.appendChild(editBtn);
    }

    // --- Add Drag and Drop handlers if in edit mode ---
    // This needs to be outside the if/else to be attached correctly after re-render

    // AGENDA D&D
    let draggedItemIndex = null;
    const removeDropIndicator = () => {
        const indicator = agendaContainer.querySelector('.drop-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    agendaContainer.ondragstart = e => {
        const target = e.target.closest('.agenda-item-edit');
        if (target) {
            draggedItemIndex = parseInt(target.dataset.index, 10);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => target.classList.add('dragging'), 0);
        }
    };

    agendaContainer.ondragover = e => {
        e.preventDefault();
        if (!isAgendaEditing) return;
        const target = e.target.closest('.agenda-item-edit');
        if (!target || target.dataset.index === String(draggedItemIndex)) return;

        removeDropIndicator();

        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';

        if (e.clientY < midpoint) {
            target.parentNode.insertBefore(indicator, target);
        } else {
            target.parentNode.insertBefore(indicator, target.nextSibling);
        }
    };

    agendaContainer.ondragleave = e => {
        if (e.target === agendaContainer) {
            removeDropIndicator();
        }
    };

    agendaContainer.ondragend = e => {
        e.target.closest('.agenda-item-edit')?.classList.remove('dragging');
        draggedItemIndex = null;
        removeDropIndicator();
    };

    agendaContainer.ondrop = e => {
        if (!isAgendaEditing) return;
        e.preventDefault();
        const indicator = agendaContainer.querySelector('.drop-indicator');
        if (!indicator || draggedItemIndex === null) {
            removeDropIndicator(); // Also remove on failed drop
            return;
        }

        const items = Array.from(agendaContainer.querySelectorAll('.agenda-item-edit, .drop-indicator'));
        const newIndex = items.indexOf(indicator);
        
        removeDropIndicator();

        // Adjust index if dragging downwards
        const finalIndex = newIndex > draggedItemIndex ? newIndex - 1 : newIndex;

        const [draggedItem] = meetingData.agenda.splice(draggedItemIndex, 1);
        meetingData.agenda.splice(finalIndex, 0, draggedItem);

        updateMeetingUI();
    };

    // MOTION QUEUE D&D
    let mqDraggedItemIndex = null;
    const removeMqDropIndicator = () => {
        const indicator = motionQueueContainer.querySelector('.drop-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    motionQueueContainer.ondragstart = e => {
        const target = e.target.closest('.agenda-item-edit');
        if (target && target.dataset.mqIndex) {
            mqDraggedItemIndex = parseInt(target.dataset.mqIndex, 10);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => target.classList.add('dragging'), 0);
        }
    };

    motionQueueContainer.ondragover = e => {
        e.preventDefault();
        if (!isMotionQueueEditing) return;
        const target = e.target.closest('.agenda-item-edit');
        if (!target || target.dataset.mqIndex === String(mqDraggedItemIndex)) return;

        removeMqDropIndicator();

        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';

        if (e.clientY < midpoint) {
            target.parentNode.insertBefore(indicator, target);
        } else {
            target.parentNode.insertBefore(indicator, target.nextSibling);
        }
    };

    motionQueueContainer.ondragend = e => {
        e.target.closest('.agenda-item-edit')?.classList.remove('dragging');
        mqDraggedItemIndex = null;
        removeMqDropIndicator();
    };

    motionQueueContainer.ondrop = e => {
        if (!isMotionQueueEditing) return;
        e.preventDefault();
        const indicator = motionQueueContainer.querySelector('.drop-indicator');
        if (!indicator || mqDraggedItemIndex === null) {
            removeMqDropIndicator();
            return;
        }
        const items = Array.from(motionQueueContainer.querySelectorAll('.agenda-item-edit, .drop-indicator'));
        const newIndex = items.indexOf(indicator);
        const finalIndex = newIndex > mqDraggedItemIndex ? newIndex - 1 : newIndex;
        const [draggedItem] = meetingData.motionQueue.splice(mqDraggedItemIndex, 1);
        meetingData.motionQueue.splice(finalIndex, 0, draggedItem);
        removeMqDropIndicator();
        updateMeetingUI();
    };
}

// When the page loads, try to get data from local storage.
// If it's not there, use the initial data and save it for next time.
window.onload = () => {
    const storedMeetingData = loadMeetingDataFromStorage();
    if (storedMeetingData) {
        meetingData = storedMeetingData;
    } else {
        meetingData = initialMeetingData;
        saveMeetingDataToStorage(meetingData);
    }
    
    updateMeetingUI();
};
