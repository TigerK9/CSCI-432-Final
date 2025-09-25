// A JavaScript object to hold the profile data. This is similar to a Python dictionary.
// You can hard-code your data here and it will be displayed when the page loads.
let profileData = {
    name: 'John Doe',
    description: 'A passionate developer.',
    email: 'john.doe@example.com',
    phone: '555-123-4567'
};

// Function to update the HTML with the data from our profileData object.
function updateProfileDisplay() {
    // Select the elements where the saved data will be displayed
    document.getElementById('savedName').textContent = profileData.name;
    document.getElementById('savedDescription').textContent = profileData.description;
    document.getElementById('savedEmail').textContent = profileData.email;
    document.getElementById('savedPhone').textContent = profileData.phone;
}

// Call the function on page load to display the initial hard-coded data.
updateProfileDisplay();

// Add an event listener to the "Save Changes" button.
// This function will be executed when the button is clicked.
document.getElementById('saveButton').addEventListener('click', function() {
    // Get the values from the input fields.
    const newName = document.getElementById('name').value;
    const newDescription = document.getElementById('description').value;
    const newEmail = document.getElementById('email').value;
    const newPhone = document.getElementById('phone').value;

    // Update the profileData object with the new values, if they are not empty.
    // This allows the user to only change specific fields.
    if (newName) {
        profileData.name = newName;
    }
    if (newDescription) {
        profileData.description = newDescription;
    }
    if (newEmail) {
        profileData.email = newEmail;
    }
    if (newPhone) {
        profileData.phone = newPhone;
    }

    // Call the function to update the display with the newly saved data.
    updateProfileDisplay();

    // Clear the input fields after saving.
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
});