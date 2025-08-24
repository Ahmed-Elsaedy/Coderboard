// export a default function or named init() – loader will call it.
// The element passed is the root element that had data-component="Login"
export default function initLogin(root: HTMLElement) {

    alert('hi login');
    // Example: wire up events
    const form = root.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        // custom behavior...
        console.debug('Login module active');
    });
}

// optional: also export named init if you prefer
export function init(root: HTMLElement) {
    initLogin(root);
}