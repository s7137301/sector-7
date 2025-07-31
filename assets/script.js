// --- THEME TOGGLE ---
function toggleTheme() {
    const body = document.body;
    body.classList.toggle("light-mode");
    const isLightMode = body.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    // CSS should handle the transition smoothly via:
    // body { transition: background-color 0.3s, color 0.3s; }
}

// --- STICKY NAVIGATION ---
function stickyNav() {
    const torBanner = document.getElementById('notice-banner');
    const navbar = document.querySelector('.navbar');
    const mainContent = document.querySelector('.main-page-content');
    const headerElement = document.querySelector('.page-main-header'); 

    if (!navbar || !mainContent) {
        // console.warn('Sticky Nav: Navbar or Main Content not found. Sticky nav disabled for this page.');
        return;
    }

    let torBannerHeight = 0;
    let navbarHeight = 0;
    let stickyTriggerPoint = 0;

    function calculateDimensionsAndTrigger() {
        torBannerHeight = (torBanner && getComputedStyle(torBanner).display !== 'none' && getComputedStyle(torBanner).position === 'fixed') ? torBanner.offsetHeight : 0;
        navbarHeight = navbar.offsetHeight;
        
        document.documentElement.style.setProperty('--tor-banner-actual-height', `${torBannerHeight}px`);
        document.body.style.paddingTop = `${torBannerHeight}px`;

        if (headerElement) {
            stickyTriggerPoint = headerElement.offsetTop + headerElement.offsetHeight - torBannerHeight;
        } else {
            stickyTriggerPoint = navbar.offsetTop - torBannerHeight;
        }
        stickyTriggerPoint = Math.max(0, stickyTriggerPoint); 
    }

    function updateStickyState() {
        let currentTorBannerHeight = (torBanner && getComputedStyle(torBanner).display !== 'none' && getComputedStyle(torBanner).position === 'fixed') ? torBanner.offsetHeight : 0;

        // Ensure body's padding-top is always correct if the banner height could somehow change
        if (parseFloat(document.body.style.paddingTop) !== currentTorBannerHeight) {
            document.body.style.paddingTop = `${currentTorBannerHeight}px`;
        }
        
        if (window.scrollY >= stickyTriggerPoint) {
            if (!navbar.classList.contains('sticky')) {
                navbar.classList.add('sticky');
                // Add padding to mainContent only if it exists
                if(mainContent) mainContent.style.paddingTop = `${navbarHeight}px`; 
            }
            navbar.style.top = `${currentTorBannerHeight}px`; 
        } else {
            if (navbar.classList.contains('sticky')) {
                navbar.classList.remove('sticky');
                navbar.style.top = ''; 
                if(mainContent) mainContent.style.paddingTop = '0'; 
            }
        }
    }

    // Initial setup
    calculateDimensionsAndTrigger();
    updateStickyState(); 

    // Event listeners
    window.addEventListener('scroll', updateStickyState, { passive: true });
    window.addEventListener('resize', () => {
        calculateDimensionsAndTrigger(); 
        updateStickyState();  
    });
}


// --- CONSOLIDATED DOMCONTENTLOADED ---
document.addEventListener("DOMContentLoaded", () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    // Initialize FAQ Toggles
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const questionButton = item.querySelector('.faq-question');
            if (questionButton) {
                questionButton.addEventListener('click', () => {
                    const wasCurrentlyOpen = item.classList.contains('open');
                    // Close all other FAQ items first
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) { 
                           otherItem.classList.remove('open');
                        }
                    });
                    // Toggle the clicked item: if it was closed, open it. If it was open (and others closed), close it.
                    if (!wasCurrentlyOpen) {
                        item.classList.add('open');
                    } else {
                        item.classList.remove('open'); // Allows toggling the same item off if it was the one open
                    }
                });
            }
        });
    }

    // Simulate status for all sites (if on status page)
    if (document.getElementById('main-onion-status')) { 
        simulateChecking('main-onion-status', 'Online', 'var(--highlight-green)');
        simulateChecking('backup-onion-status', 'Online', 'var(--highlight-green)');
        simulateChecking('clearnet-status', 'Outdated', 'var(--yellow-highlight)'); 
        simulateChecking('backup-clearnet-status', 'Online', 'var(--highlight-green)');
    }
    
    // Maintenance Timer
    const maintenanceTimerEl = document.getElementById('maintenance-timer');
    if (maintenanceTimerEl) {
        const maintenanceEnd = new Date('2025-03-20T23:59:00+10:00').getTime(); 
        let timerInterval; 
        function updateTimer() {
            const now = new Date().getTime();
            const timeRemaining = maintenanceEnd - now;
            if (timeRemaining <= 0) {
                maintenanceTimerEl.textContent = "Maintenance has ended! The site is back online.";
                if (timerInterval) clearInterval(timerInterval); 
            } else {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                maintenanceTimerEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
            }
        }
        updateTimer(); 
        timerInterval = setInterval(updateTimer, 1000); 
    }

    // Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    const dismissButton = document.getElementById('dismiss-splash');
    if (splashScreen && dismissButton) {
        if (localStorage.getItem('splashDismissed') === 'true') {
            splashScreen.style.display = 'none';
        } else {
            // Ensure splash screen is visible if not dismissed
            splashScreen.style.display = 'flex'; // or 'block', depending on its CSS
        }
        dismissButton.addEventListener('click', () => {
            splashScreen.style.display = 'none';
            localStorage.setItem('splashDismissed', 'true');
        });
    }

    // Turnstile related JavaScript from this file is removed.
    // The `index.html` page handles its Turnstile button's redirect via an inline `onclick` attribute
    // which calls its own `handleRedirect()` function defined in a <script> tag on that page.

    // Initialize Sticky Navigation for pages that have the navbar and main content structure
    if (document.querySelector('.navbar') && document.querySelector('.main-page-content')) {
        stickyNav();
    }
});

// --- STATUS SIMULATION ---
function simulateChecking(elementId, actualStatus, color, delay = 1500) {
    const statusElement = document.getElementById(elementId);
    if (statusElement) {
        statusElement.textContent = "Checking...";
        statusElement.style.color = "var(--yellow-highlight)"; 
        setTimeout(() => {
            statusElement.textContent = actualStatus;
            statusElement.style.color = color; 
        }, delay);
    }
}
const supportedLanguages = ['es', 'fr', 'de', 'it', 'ja', 'zh', 'ar'];
const currentPath = window.location.pathname;
const browserLang = navigator.language.slice(0, 2);

function dismissLanguagePopup() {
  document.getElementById('language-popup').classList.add('hidden');
  localStorage.setItem('languagePromptDismissed', 'true');
}

function showLanguagePopup() {
  const langName = new Intl.DisplayNames([browserLang], { type: 'language' }).of(browserLang);
  document.getElementById('lang-popup-message').textContent =
    `You're currently viewing the English site. Switch to the ${langName} version?`;
  document.getElementById('language-popup').classList.remove('hidden');
  document.getElementById('lang-yes').addEventListener('click', () => {
    window.location.href = `/${browserLang}/`;
  });
}

if (
  supportedLanguages.includes(browserLang) &&
  !currentPath.startsWith(`/${browserLang}/`) &&
  !localStorage.getItem('languagePromptDismissed')
) {
  showLanguagePopup();
}
// --- LANGUAGE POPUP ---
// Language Popup for switching between English and browser detected language
document.addEventListener('DOMContentLoaded', () => {
    const supportedLangs = ['en', 'es'];
    const currentLang = window.location.pathname.split('/')[1] || 'en';
    const userLang = navigator.language.slice(0, 2);
  
    if (supportedLangs.includes(userLang) && userLang !== currentLang) {
      showLanguagePopup(userLang);
    }
  
    function showLanguagePopup(lang) {
      const messages = {
        en: {
          title: "We speak your language!",
          body: "Would you like to switch to the English version of this site?",
          button: "Switch to English"
        },
        es: {
          title: "¡Hablamos tu idioma!",
          body: "¿Deseas cambiar al sitio web en Español?",
          button: "Cambiar a Español"
        }
      };
  
      const msg = messages[lang];
      const popup = document.createElement('div');
      popup.className = 'lang-popup';
      popup.innerHTML = `
        <div class="lang-popup-box">
          <h2>${msg.title}</h2>
          <p>${msg.body}</p>
          <div class="lang-popup-buttons">
            <button onclick="window.location.href='/${lang}/home.html'">${msg.button}</button>
            <button class="lang-dismiss">Stay Here</button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);
  
      popup.querySelector('.lang-dismiss').onclick = () => {
        popup.remove();
      };
    }
  });
  