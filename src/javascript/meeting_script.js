// The main data variable containing all meeting information.
// You can change the values here to update the content on the page.
const meetingData = {
    // Current motion data: an object with name, description, and creator.
    currentMotion: {
        name: "Current Motion: Approve new budget for Q3",
        description: `"I move to approve the new budget for the third quarter of this fiscal year."`,
        creator: "Jane Doe"
    },
    
    // Agenda data: an array of strings.
    agenda: [
        "1. Call to order",
        "2. Approval of previous minutes",
        "3. Motion: Approve new budget for Q3",
        "4. Report from the Finance Committee",
        "5. New Business"
    ],

    // Motion queue data: an array of strings.
    motionQueue: [
        "1. Motion to table the discussion",
        "2. Motion to amend the previous motion",
        "3. Motion to end the debate"
    ]
};

// Function to update the HTML content based on the meetingData variable.
function updateMeetingUI() {
    // --- Update the Current Motion section ---
    // Get the HTML elements by their new IDs.
    const motionNameEl = document.getElementById('motion-name');
    const motionDescriptionEl = document.getElementById('motion-description');
    const motionCreatorEl = document.getElementById('motion-creator');

    // Populate the elements with data from the `meetingData` variable.
    motionNameEl.textContent = meetingData.currentMotion.name;
    motionDescriptionEl.textContent = meetingData.currentMotion.description;
    motionCreatorEl.textContent = `(Moved by: ${meetingData.currentMotion.creator})`;

    // --- Update the Agenda section ---
    const agendaContainer = document.getElementById('agenda-container');
    // Clear any existing content in the container.
    agendaContainer.innerHTML = '';
    
    // Loop through the `agenda` array and create a new HTML element for each item.
    meetingData.agenda.forEach(itemText => {
        const agendaItem = document.createElement('div');
        agendaItem.className = 'agenda-item';
        agendaItem.textContent = itemText;
        agendaContainer.appendChild(agendaItem);
    });
    
    // --- Update the Motion Queue section ---
    const motionQueueContainer = document.getElementById('motion-queue-container');
    // Clear any existing content.
    motionQueueContainer.innerHTML = '';

    // Loop through the `motionQueue` array and create a new HTML element for each item.
    meetingData.motionQueue.forEach(itemText => {
        const motionItem = document.createElement('div');
        motionItem.className = 'motion-item';
        motionItem.textContent = itemText;
        motionQueueContainer.appendChild(motionItem);
    });
}

// Call the function when the page loads to display the initial data.
window.onload = updateMeetingUI;
