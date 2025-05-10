function switchLanguage() {
    // Get current language from HTML lang attribute
    const currentLang = document.documentElement.lang || 'en';
    // Switch between 'en' and 'ar'
    const newLang = currentLang === 'ar' ? 'en' : 'ar';

    // Set the cookie for ASP.NET Core culture
    document.cookie = `Culture=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year expiration

    // Reload the page to apply new culture
    location.reload();
}

// Function to toggle theme
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    // Toggle the class
    html.classList.toggle('dark');
    
    // Update localStorage
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    
    // Update the icon visibility
    updateThemeIcon(isDark ? 'light' : 'dark');
}

function updateThemeIcon(theme) {
    // Make selector more specific to avoid potential conflicts
    const sunIcon = document.querySelector('[data-theme-icon="sun"]');
    const moonIcon = document.querySelector('[data-theme-icon="moon"]');
    
    if (!sunIcon || !moonIcon) return; // Guard clause
    
    if (theme === 'dark') {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

function applyThemeFromLocalStorage() {
    const theme = localStorage.getItem('theme') || 
                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Update the icon state
    updateThemeIcon(theme);
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', e.matches);
        updateThemeIcon(newTheme);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    applyThemeFromLocalStorage();
});