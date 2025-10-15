document.addEventListener('DOMContentLoaded', () => {
    // Get references to elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signInButton = document.getElementById('signInButton');
    const loginForm = document.getElementById('loginForm');

    const USERS_STORAGE_KEY = 'ronr-users';

    // Initialize default admin user if no users exist in localStorage.
    // This runs on the login page to ensure the admin account is always available.
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        const defaultUsers = {
            'admin@email.com': {
                password: 'password',
                role: 'admin'
            },
            'chairman@email.com': {
                password: 'password',
                role: 'chairman'
            },
            'member@email.com': {
                password: 'password',
                role: 'member'
            }
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    }
    // Function to get users from local storage.
    const getUsers = () => {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || {};
    };

    // Function to check input fields and toggle button state
    const checkFormValidity = () => {
        // Basic check: ensure both fields have non-empty values
        const isFormValid = emailInput.value.trim() !== '' && 
                            passwordInput.value.trim() !== '';

        signInButton.disabled = !isFormValid;
        
        // Optional: Add visual feedback for the button state
        if (isFormValid) {
            signInButton.style.opacity = '1';
            signInButton.style.cursor = 'pointer';
        } else {
            signInButton.style.opacity = '0.7';
            signInButton.style.cursor = 'not-allowed';
        }
    };

    // Listen for input changes to enable/disable the button dynamically
    emailInput.addEventListener('input', checkFormValidity);
    passwordInput.addEventListener('input', checkFormValidity);

    // Handle form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default form submission (page reload)

        if (!signInButton.disabled) {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            const users = getUsers();

            // Check if user exists and password is correct
            const user = users[email];
            if (user && user.password === password) {
                // --- Login Success ---
                localStorage.setItem('isLoggedIn', 'true');
                // Store current user's email for personalization
                localStorage.setItem('currentUserEmail', email);
                // Store current user's role for authorization
                localStorage.setItem('currentUserRole', user.role);
                
                alert('Login successful!');
                window.location.href = 'home.html'; // Redirect to the home page
            } else {
                // --- Login Failure ---
                alert('Invalid email or password. Please try again.');
                passwordInput.value = ''; // Clear password field
            }
        }
    });

    // Initial check on page load
    checkFormValidity();
});
