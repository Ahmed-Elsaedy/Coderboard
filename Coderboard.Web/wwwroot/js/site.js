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

// Re-wire jQuery Unobtrusive Validation after any htmx swap
document.body.addEventListener('htmx:afterSwap', function (evt) {
    // Re-parse only within the swapped target (faster than parsing the whole document)
    const scope = evt.detail && evt.detail.target ? evt.detail.target : document;

    $(scope).find('form[data-val="true"]').each(function () {
        // Clear any previous validation data & re-parse
        $(this).removeData('validator');
        $(this).removeData('unobtrusiveValidation');
        $.validator.unobtrusive.parse(this);
    });

    const firstError = document.querySelector('.input-validation-error, [data-valmsg-summary] .field-validation-error');
    if (firstError) (firstError.closest('input,select,textarea') || firstError).focus();
});

document.body.addEventListener('htmx:configRequest', function (evt) {
    const elt = evt.detail.elt;
    const form = elt.closest('form');
    if (!form) return; // not inside a form → do nothing

    // Guard: run ONLY for actual form submissions (boosted)
    const isSubmit = (elt === form) || elt.matches('button[type="submit"], input[type="submit"]');
    if (!isSubmit) return; // allow anchors/links inside forms

    // Optional: only enforce on non-GET forms (login/register)
    const method = (form.getAttribute('method') || 'get').toLowerCase();
    if (method === 'get') return;

    // Ensure unobtrusive is wired, then validate
    if (!$(form).data('validator')) $.validator.unobtrusive.parse(form);
    if (!$(form).valid()) {
        evt.preventDefault(); // block the htmx request
    }
});


(function () {
    const host = document.getElementById('toasts');

    function toast({ title = '', message = '', type = 'info', timeout = 4000 } = {}) {
        const theme = {
            success: {
                bg: 'bg-emerald-50', text: 'text-emerald-900', ring: 'ring-emerald-200',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12.75L11.25 15 15 9.75" /><path fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" clip-rule="evenodd"/></svg>'
            },
            error: {
                bg: 'bg-rose-50', text: 'text-rose-900', ring: 'ring-rose-200',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8v5"/><circle cx="12" cy="16" r="1.25"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>'
            },
            info: {
                bg: 'bg-sky-50', text: 'text-sky-900', ring: 'ring-sky-200',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11 10h2v7h-2zM11 7h2v2h-2z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>'
            }
        }[type] || theme.info;

        const el = document.createElement('div');
        el.className = `pointer-events-auto w-80 max-w-[90vw] overflow-hidden rounded-xl shadow-lg ring-1 ${theme.ring} ${theme.bg} ${theme.text} 
                      transition transform duration-200 ease-out translate-y-2 opacity-0`;
        el.innerHTML = `
        <div class="p-3 flex gap-3">
          <div class="mt-0.5">${theme.icon}</div>
          <div class="flex-1">
            ${title ? `<div class="font-semibold leading-5">${title}</div>` : ``}
            ${message ? `<div class="text-sm/5 opacity-90">${message}</div>` : ``}
          </div>
          <button type="button" class="shrink-0 rounded-md p-1/2 opacity-70 hover:opacity-100" aria-label="Close">&times;</button>
        </div>
      `;

        host.appendChild(el);
        // enter animation
        requestAnimationFrame(() => {
            el.classList.remove('translate-y-2', 'opacity-0');
            el.classList.add('translate-y-0', 'opacity-100');
        });

        const closeBtn = el.querySelector('button');
        const remove = () => {
            el.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => el.remove(), 180);
        };
        closeBtn.addEventListener('click', remove);
        const t = setTimeout(remove, timeout);
        el.addEventListener('pointerenter', () => clearTimeout(t)); // pause on hover
        return remove;
    }

    // Expose for manual use if you like
    window.showToast = toast;

    // htmx errors → error toast
    document.body.addEventListener('htmx:responseError', (e) => {
        const st = e.detail.xhr.status;
        let msg = 'Something went wrong.';
        try {
            const ct = e.detail.xhr.getResponseHeader('Content-Type') || '';
            if (ct.includes('application/json')) {
                const data = JSON.parse(e.detail.xhr.responseText || '{}');
                msg = data.message || data.title || msg;
            }
        } catch { }
        toast({ title: `Error ${st}`, message: msg, type: 'error' });
    });
    document.body.addEventListener('htmx:sendError', () => {
        toast({ title: 'Network error', message: 'Please check your connection and try again.', type: 'error' });
    });

    // Server-driven success/info/error via HX-Trigger
    // Example in C#: Response.Headers["HX-Trigger"] = JsonSerializer.Serialize(new { toast = new { type="success", title="Saved", message="Profile updated" }});
    document.body.addEventListener('toast', (e) => toast(e.detail || {}));
})();