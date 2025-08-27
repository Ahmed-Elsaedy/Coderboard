// site.ts � HOST RUNTIME (uses ambient types from shared contracts)
class HostPageImpl {
    constructor() {
        this.modules = [];
    }
    get(key) { return this.modules.find(m => m.key === key); }
    all(url) { return url ? this.modules.filter(m => m.url === url) : [...this.modules]; }
    cast(key) { return this.get(key)?.instance; }
    _register(rec) { this.modules.push(rec); }
    _unregisterByEl(el) {
        const i = this.modules.findIndex(m => m.el === el);
        if (i >= 0)
            this.modules.splice(i, 1);
    }
}
// Singleton host for this page
export const host = new HostPageImpl();
if (!document.page)
    document.page = host;
// ---------- helpers ----------
const urlOf = (el) => el.getAttribute('data-module') ?? '';
const keyOf = (el) => el.getAttribute('data-key') ?? ''; // REQUIRED
const isRoot = (n) => n.matches?.('[data-module]') ?? false;
function findRoots(container) {
    const out = [];
    if (isRoot(container))
        out.push(container);
    container.querySelectorAll?.('[data-module]')?.forEach(e => out.push(e));
    return out;
}
function depth(el) { let d = 0, n = el; while (n) {
    d++;
    n = n.parentElement;
} return d; }
const APP_VER = document.querySelector('meta[name="app-version"]')?.content ?? '';
const withBust = (u) => APP_VER ? `${u}?v=${encodeURIComponent(APP_VER)}` : u;
// ---------- core ----------
async function initNew(el, url, key) {
    const mod = await import(withBust(url));
    const Ctor = (mod.default ?? mod.Component ?? mod.Module);
    if (typeof Ctor !== 'function') {
        console.warn(`[site] ${url} must export a class as default/Component/Module`);
        return;
    }
    const instance = new Ctor();
    await instance.onInit?.(el, host);
    host._register({ key, url, el, instance });
}
async function updateExisting(rec, newEl) {
    const prev = rec.el;
    rec.el = newEl;
    if (typeof rec.instance.onUpdate === 'function') {
        await rec.instance.onUpdate(newEl, host, prev);
    }
}
async function destroyByEl(el) {
    const list = host.modules;
    const rec = list.find(m => m.el === el);
    if (!rec)
        return;
    try {
        await rec.instance.onDestroy?.();
    }
    finally {
        host._unregisterByEl(el);
    }
}
export async function reconcile(container = document) {
    const newRoots = findRoots(container);
    const seen = new Set();
    // create/update
    for (const el of newRoots) {
        const url = urlOf(el), key = keyOf(el);
        if (!url || !key)
            continue;
        seen.add(key);
        const existing = host.get(key);
        if (existing) {
            if (existing.url === url)
                await updateExisting(existing, el);
            else {
                await destroyByEl(existing.el);
                await initNew(el, url, key);
            }
        }
        else {
            await initNew(el, url, key);
        }
    }
    // remove orphans (child-first)
    const toRemove = [];
    for (const rec of host.modules) {
        const inScope = container.contains(rec.el) || rec.el === container;
        if (!inScope)
            continue;
        const stillInDom = document.contains(rec.el);
        if (!stillInDom || !seen.has(rec.key))
            toRemove.push(rec.el);
    }
    toRemove.sort((a, b) => depth(b) - depth(a));
    for (const el of toRemove)
        await destroyByEl(el);
}
// wire up
document.addEventListener('DOMContentLoaded', () => { reconcile(document); });
document.body.addEventListener('htmx:afterSwap', e => { reconcile(e.detail?.target || document); });
document.body.addEventListener('htmx:beforeCleanupElement', e => {
    const node = e.target;
    const roots = findRoots(node).sort((a, b) => depth(b) - depth(a));
    roots.forEach(el => { void destroyByEl(el); });
});
// optional debug handle
(Object.assign(window, { host }));
