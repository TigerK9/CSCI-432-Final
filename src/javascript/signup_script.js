// Wait for the DOM to be fully loaded before trying to access elements
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to all necessary elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const signupForm = document.querySelector('form');

    const USERS_STORAGE_KEY = 'ronr-users';

    // Function to check all validation rules
    const checkFormValidity = () => {
      // Check if all three required fields are filled (basic validation)
        const isFormValid = nameInput.value.trim() !== '' &&
                            emailInput.value.trim() !== '' &&
                            passwordInput.value.trim() !== '';
          if (isFormValid) {
              // If valid: apply the active color, enable the button
              createAccountBtn.classList.add('btn-valid-state');
              createAccountBtn.classList.remove('btn-disabled-state');
              createAccountBtn.disabled = false;
          } else {
              // If invalid: revert to default color, disable the button
              createAccountBtn.classList.remove('btn-valid-state');
              createAccountBtn.classList.add('btn-disabled-state');
              createAccountBtn.disabled = true;
          }
    };

    // Array of inputs to listen to
    nameInput.addEventListener('input', checkFormValidity);
    emailInput.addEventListener('input', checkFormValidity);
    passwordInput.addEventListener('input', checkFormValidity);

    // Handle form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Always prevent default to handle via JS

        // Only proceed if the button is not disabled
        if (!createAccountBtn.disabled) {
            const email = emailInput.value.trim();
            const password = passwordInput.value; // Don't trim password

            // Load existing users or initialize a new object
            let users = {};
            try {
                const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
                if (storedUsers) {
                    users = JSON.parse(storedUsers);
                }
            } catch (error) {
                console.error('Error parsing users from localStorage', error);
            }

            // Check if user already exists
            if (users[email]) {
                alert('An account with this email already exists. Please log in.');
                return;
            }

            // Add new user and save to localStorage
            users[email] = {
                password: password,
                role: 'member' // Default role for new signups
            };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

            alert('Account created successfully! Please log in.');
            window.location.href = 'login.html';
        }
    });

    // Run once on load to initialize button state
    checkFormValidity();
});