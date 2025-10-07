document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const modal = document.getElementById("newMeetingModal");
    const closeBtn = modal.querySelector(".close");
    const meetingForm = document.getElementById("meetingForm");
    const newMeetingBox = document.getElementById("newMeetingBox");

    // Intercept the New Meeting click to open modal
    newMeetingBox.addEventListener("click", function (event) {
      event.preventDefault(); // prevent any default behavior
      modal.style.display = "block"; // show modal
    });

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
      
      // --- Placeholder for actual backend or dynamic card generation ---
      // This is where you would typically create a new database entry (e.g., Firestore)
      // or dynamically inject a new meeting card into the grid.
      // -----------------------------------------------------------------
      
      // Close and reset form after successful submission
      modal.style.display = "none";
      meetingForm.reset();
    });
});
