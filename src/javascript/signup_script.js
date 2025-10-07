// Wait for the DOM to be fully loaded before trying to access elements
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to all necessary elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const createAccountBtn = document.getElementById('createAccountBtn');

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
    const inputs = [nameInput, emailInput, passwordInput];

    // Attach the checkFormValidity function to the 'input' event for real-time validation
    inputs.forEach(input => {
      input.addEventListener('input', checkFormValidity);
    });

    // Handle form submission
    createAccountBtn.closest('form').addEventListener('submit', (e) => {
        // Only prevent submission if the button is currently disabled
        if (createAccountBtn.disabled) {
            e.preventDefault();
        } else {
            console.log("Form is valid and ready to submit!");
            // In a real application, you would send data to the server here (e.g., using fetch API)
            // e.preventDefault(); // Uncomment this line if you want to prevent a full page reload for testing
        }
    });

    // Run once on load to initialize button state
    checkFormValidity();
});