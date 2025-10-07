document.addEventListener('DOMContentLoaded', () => {
    // Get references to elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signInButton = document.getElementById('signInButton');
    const loginForm = document.getElementById('loginForm');

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

            console.log("Attempting sign in with:");
            console.log(`Email: ${email}`);
            console.log(`Password: ${'*'.repeat(password.length)}`);
            
            // --- Placeholder for Authentication Logic ---
            // In a real application, you would use Firebase Auth (or another provider) here:
            // signInWithEmailAndPassword(auth, email, password)
            //     .then((userCredential) => {
            //         console.log("Login successful!", userCredential.user);
            //         window.location.href = 'home.html'; 
            //     })
            //     .catch((error) => {
            //         console.error("Login failed:", error.message);
            //         // Display error message to the user (e.g., "Invalid credentials")
            //     });
            // ---------------------------------------------
            
            // For demonstration: show success in console
            console.log("Login sequence initiated. Replace this with actual Firebase authentication.");
        }
    });

    // Initial check on page load
    checkFormValidity();
});
