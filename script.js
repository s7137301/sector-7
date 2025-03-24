function toggleTheme() {
    const body = document.body;
    body.classList.toggle("light-mode");

    // Save theme preference in localStorage
    const isLightMode = body.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
}

// Apply theme preference on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
});
function toggleTheme() {
    const body = document.body;
    body.classList.toggle("light-mode");

    // Save theme preference
    const isLightMode = body.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");

    // Add transition for smoother effect
    body.style.transition = "background-color 0.5s, color 0.5s";
}

// Apply the saved theme on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item'); // Select all FAQ items

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question'); // Select the button inside each FAQ item
        questionButton.addEventListener('click', () => {
            // Toggle the "open" class to expand/collapse the answer
            item.classList.toggle('open');

            // Optionally close other FAQ items (accordion-style behavior)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                }
            });
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Check if the banner has been dismissed
    if (localStorage.getItem('bannerDismissed') === 'true') {
        const banner = document.getElementById('notice-banner');
        if (banner) banner.style.display = 'none';
    }
});

function closeBanner() {
    const banner = document.getElementById('notice-banner');
    if (banner) {
        banner.style.display = 'none'; // Hide the banner
        localStorage.setItem('bannerDismissed', 'true'); // Save dismissal state
    }
}
// Function to simulate status checking
function simulateChecking(elementId, actualStatus, color, delay = 2000) {
    const statusElement = document.getElementById(elementId);
    if (statusElement) {
        statusElement.textContent = "Checking...";
        statusElement.style.color = "#ffcc00"; // Yellow for "Checking..."
        setTimeout(() => {
            statusElement.textContent = actualStatus; // Set actual status after delay
            statusElement.style.color = color; // Set status color
        }, delay); // Delay in milliseconds
    }
}

// Simulate status for all sites
document.addEventListener('DOMContentLoaded', () => {
    // Main Onion Site
    simulateChecking('main-onion-status', 'OFFLINE', 'red');
    
    // Backup Onion Site
    simulateChecking('backup-onion-status', 'OFFLINE', 'red');
    
    // Clearnet Site
    simulateChecking('clearnet-status', 'Online', 'green');
});
document.addEventListener('DOMContentLoaded', () => {
    // Set the end date and time for maintenance in Brisbane time
    const maintenanceEnd = new Date('2025-03-20T23:59:00+10:00').getTime(); // Brisbane time (AEST)

    // Function to update the countdown timer
    function updateTimer() {
        const now = new Date().getTime(); // Current time
        const timeRemaining = maintenanceEnd - now;

        if (timeRemaining <= 0) {
            // If maintenance has ended
            document.getElementById('maintenance-timer').textContent = "Maintenance has ended! The site is back online.";
        } else {
            // Calculate remaining time
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            // Display the timer
            document.getElementById('maintenance-timer').textContent =
                `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
        }
    }

    // Update the timer every second
    updateTimer(); // Run immediately
    setInterval(updateTimer, 1000);
});
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const dismissButton = document.getElementById('dismiss-splash');

    // Check if the splash screen has already been dismissed
    if (localStorage.getItem('splashDismissed') === 'true') {
        splashScreen.style.display = 'none'; // Don't show the splash screen
    }

    // Event listener to dismiss the splash screen
    dismissButton.addEventListener('click', () => {
        splashScreen.style.display = 'none'; // Hide the splash screen
        localStorage.setItem('splashDismissed', 'true'); // Save dismissal state
    });
});
document.getElementById("submit-button").addEventListener("click", () => {
    // Wait for Turnstile token to be generated
    const turnstileWidget = document.querySelector(".cf-turnstile");
    const token = turnstileWidget.dataset.token;
  
    if (token) {
      // Simulate successful Turnstile validation
      console.log("Token generated:", token);
  
      // Redirect to home page (replace with your URL)
      window.location.href = "home.html";
    } else {
      alert("Please complete the Turnstile.");
    }
  });
  
