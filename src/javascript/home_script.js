const initialMeetingsData = [
  {
    name: "Meeting 1",
    description: "Project kickoff discussion",
    datetime: "Sept 25, 2025 · 2:00 PM",
    link: "meeting.html",
  },
  {
    name: "Meeting 2",
    description: "Design brainstorming session",
    datetime: "Sept 26, 2025 · 11:00 AM",
    link: "meeting.html",
  },
  {
    name: "Meeting 3",
    description: "Weekly status update",
    datetime: "Sept 27, 2025 · 9:30 AM",
    link: "meeting.html",
  },
  {
    name: "Meeting 4",
    description: "Weekly status update",
    datetime: "Sept 28, 2025 · 9:30 AM",
    link: "meeting.html",
  },
];

// This will be our main data source, populated from localStorage or the initial data.
let meetingsData = [];

const MEETINGS_STORAGE_KEY = 'ronr-meetingsData';

/**
 * Loads meetings from local storage.
 * @returns {Array | null} The parsed meetings array or null if not found.
 */
function loadMeetingsFromStorage() {
  const storedMeetings = localStorage.getItem(MEETINGS_STORAGE_KEY);
  try {
    return storedMeetings ? JSON.parse(storedMeetings) : null;
  } catch (e) {
    console.error("Error parsing meetings from localStorage", e);
    return null;
  }
}

/**
 * Saves the current meetings array to local storage.
 * @param {Array} meetings The meetings array to save.
 */
function saveMeetingsToStorage(meetings) {
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
}

/**
 * Renders all meeting boxes, including the static "New Meeting" box.
 */
function renderMeetings() {
  const gridContainer = document.querySelector(".grid-container");
  gridContainer.innerHTML = ""; // Clear existing content

  // Render meeting boxes from data
  meetingsData.forEach((meeting) => {
    const meetingBoxHTML = `
      <a href="${meeting.link}" class="box-link">
        <div class="box">
          <div class="meeting-name">${meeting.name}</div>
          <div class="meeting-description">${meeting.description}</div>
          <div class="meeting-datetime">${meeting.datetime}</div>
        </div>
      </a>
    `;
    gridContainer.innerHTML += meetingBoxHTML;
  });

  // Only add the "New Meeting" box for admins and chairmen
  const userRole = localStorage.getItem('currentUserRole');
  if (userRole === 'admin' || userRole === 'chairman') {
    const newMeetingBoxHTML = `
      <div class="box new-meeting" id="newMeetingBox">
        <div class="plus">+</div>
        <div>New Meeting</div>
      </div>
    `;
    gridContainer.innerHTML += newMeetingBoxHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load meetings from storage or use initial data
  const storedMeetings = loadMeetingsFromStorage();
  if (storedMeetings) {
    meetingsData = storedMeetings;
  } else {
    meetingsData = initialMeetingsData;
    saveMeetingsToStorage(meetingsData);
  }

  renderMeetings(); 

  // Elements (consolidated from both branches)
  const modal = document.getElementById("newMeetingModal");
  const closeBtn = modal.querySelector(".close");
  const meetingForm = document.getElementById("meetingForm");
  
  // --- Logout Button ---
  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserEmail');
      window.location.href = 'login.html';
  });

  // The "New Meeting" box is only rendered for specific roles, so we only
  // need to add the listener if the box exists.
  const newMeetingBox = document.getElementById('newMeetingBox');
  if (newMeetingBox) {
    newMeetingBox.addEventListener('click', function (event) {
      event.preventDefault();
      modal.style.display = 'block'; // show modal
    });
  }


  // Close modal on X click (Kept from both branches)
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  // Close modal when clicking outside of the modal content (Kept from both branches)
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Handle form submit (Kept from both branches)
  meetingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = meetingForm.meetingName.value;
    const description = meetingForm.meetingDescription.value;
    const date = meetingForm.meetingDate.value;

    const newMeeting = {
      name,
      description: description || 'No description provided.', // Use the new description from the form
      // Format the date for display
      datetime: new Date(date).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
      }).replace(',', ' ·'),
      link: "meeting.html", // Hardcode the link
    };

    // Add the new meeting to our data array
    meetingsData.push(newMeeting);
    // Save the updated array to local storage
    saveMeetingsToStorage(meetingsData);
    // Re-render the UI to show the new meeting
    renderMeetings();

    // Close and reset form after successful submission
    modal.style.display = "none";
    meetingForm.reset();
  });
});