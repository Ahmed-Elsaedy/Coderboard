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


(function () {
    // tiny helper used only for comparisons inside the template
    Handlebars.registerHelper('eq', (a, b) => a === b);

    const host = document.getElementById('toasts');

    let tpl = null;
    (async () => {
        const res = await fetch('/templates/toast.hbs', { cache: 'force-cache' });
        const src = await res.text();
        tpl = Handlebars.compile(src);
    })();

    debugger;

    function renderToast({ type = 'info', title = '', message = '', timeout = 4000 } = {}) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = tpl({ type, title, message });
        const el = wrapper.firstElementChild;
        host.appendChild(el);

        // enter/exit animation (class toggles only)
        requestAnimationFrame(() => {
            el.classList.remove('translate-y-2', 'opacity-0');
            el.classList.add('translate-y-0', 'opacity-100');
        });
        const remove = () => { el.classList.add('translate-y-2', 'opacity-0'); setTimeout(() => el.remove(), 180); };
        el.querySelector('button[aria-label="Close"]').addEventListener('click', remove);
        const t = setTimeout(remove, timeout);
        el.addEventListener('pointerenter', () => clearTimeout(t));
    }

    // Expose if needed
    window.renderToast = renderToast;

    // htmx → automatic error toasts
    document.body.addEventListener('htmx:responseError', (e) => {
        let msg = 'Something went wrong.', st = e.detail.xhr.status;
        try {
            const ct = e.detail.xhr.getResponseHeader('Content-Type') || '';
            if (ct.includes('application/json')) {
                const data = JSON.parse(e.detail.xhr.responseText || '{}');
                msg = data.message || data.title || msg;
            }
        } catch { }
        renderToast({ type: 'error', title: `Error ${st}`, message: msg });
    });
    document.body.addEventListener('htmx:sendError', () => {
        renderToast({ type: 'error', title: 'Network error', message: 'Please try again.' });
    });

    // Server-triggered toast via HX-Trigger
    // Response.Headers["HX-Trigger"] = JsonSerializer.Serialize(new { toast = new { type="success", title="Saved", message="Done." }});
    document.body.addEventListener('toast', (e) => renderToast(e.detail || {}));
})();


async function loadComponentFor(root) {
    if (!root) return;

    const moduleRelPath = root.getAttribute('data-module');

    if (!moduleRelPath) return;

    try {
        const mod = await import(moduleRelPath);
        const fn = mod.default || mod.init;
        if (typeof fn === 'function') {
            fn(root);
        } else {
            console.warn(`[site.js] Module ${url} did not export default/init function.`);
        }
    } catch (err) {
        console.error(`[site.js] Failed to import ${url}`, err);
    }
}

function hydrate(container = document) {
    container.querySelectorAll('[data-component]').forEach(el => loadComponentFor(el));
}

// Initial load (for normal first render)
document.addEventListener('DOMContentLoaded', () => {
    hydrate(document);
});

// HTMX integration (after swaps)
document.body.addEventListener('htmx:afterSwap', (e) => {
    // e.detail.target is where HTMX injected content
    hydrate(e.detail?.target || document);
});

// If you want to be even safer for late DOM updates:
document.body.addEventListener('htmx:afterSettle', (e) => {
    hydrate(e.detail?.target || document);
});