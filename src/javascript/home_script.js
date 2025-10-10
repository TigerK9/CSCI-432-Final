const meetingsData = [
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

  // Add the "New Meeting" box
  const newMeetingBoxHTML = `
    <div class="box new-meeting" id="newMeetingBox">
      <div class="plus">+</div>
      <div>New Meeting</div>
    </div>
  `;
  gridContainer.innerHTML += newMeetingBoxHTML;

  // Re-attach event listener for the new meeting box
  const newMeetingBox = document.getElementById("newMeetingBox");
  const modal = document.getElementById("newMeetingModal");
  newMeetingBox.addEventListener("click", function (event) {
    event.preventDefault(); // prevent any default behavior
    modal.style.display = "block"; // show modal
  });
}

document.addEventListener('DOMContentLoaded', () => {
    renderMeetings();
    const modal = document.getElementById("newMeetingModal");
    const closeBtn = modal.querySelector(".close");
    const meetingForm = document.getElementById("meetingForm");

    // Close modal on X click
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };

    // Close modal when clicking outside of the modal content
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };

    // Handle form submit
    meetingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = meetingForm.meetingName.value;
      const date = meetingForm.meetingDate.value;
      const link = meetingForm.meetingLink.value;

      console.log("New meeting info submitted:", { name, date, link });

      // TODO: In the future, you can add the new meeting to the meetingsData array
      // and re-render the list. For example:
      // meetingsData.push({ name, description: 'New from modal', datetime: date, link });
      // renderMeetings();

      // Close and reset form after successful submission
      modal.style.display = "none";
      meetingForm.reset();
    });
});
