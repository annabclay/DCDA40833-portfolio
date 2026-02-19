// Dark Mode Toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply the saved theme on page load
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
}

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save the theme preference
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    // Announce to screen readers
    const announcement = theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
    themeToggle.setAttribute('aria-label', `Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`);
});
