const PROFILE_STORAGE_KEY = 'ronr-profileData';

// Default data to be used if nothing is in local storage.
const initialProfileData = {
    name: 'John Doe',
    description: 'A passionate developer.',
    email: 'john.doe@example.com',
    phone: '555-123-4567'
};

// This will be our main data source, populated from localStorage or the initial data.
let profileData = {};

/**
 * Loads profile data from local storage.
 * @returns {object | null} The parsed profile data or null if not found.
 */
function loadProfileData() {
    const storedData = localStorage.getItem(PROFILE_STORAGE_KEY);
    try {
        return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
        console.error("Error parsing profile data from localStorage", e);
        return null;
    }
}

/**
 * Saves the current profile data to local storage.
 * @param {object} data The profile data object to save.
 */
function saveProfileData(data) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
}

// Function to update the HTML with the data from our profileData object.
function updateProfileDisplay() {
    // Select the elements where the saved data will be displayed
    document.getElementById('savedName').textContent = profileData.name;
    document.getElementById('savedDescription').textContent = profileData.description;
    document.getElementById('savedEmail').textContent = profileData.email;
    document.getElementById('savedPhone').textContent = profileData.phone;

    // Also update placeholders in the input fields for better UX
    document.getElementById('name').placeholder = profileData.name;
    document.getElementById('description').placeholder = profileData.description;
    document.getElementById('email').placeholder = profileData.email;
    document.getElementById('phone').placeholder = profileData.phone;
}

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

    // Save the updated data to local storage
    saveProfileData(profileData);

    // Call the function to update the display with the newly saved data.
    updateProfileDisplay();

    // Clear the input fields after saving.
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
});

// --- INITIALIZATION ---
// When the page loads, try to get data from local storage.
// If it's not there, use the initial data and save it for next time.
const storedProfile = loadProfileData();
if (storedProfile) {
    profileData = storedProfile;
} else {
    profileData = initialProfileData;
    saveProfileData(profileData);
}
updateProfileDisplay();