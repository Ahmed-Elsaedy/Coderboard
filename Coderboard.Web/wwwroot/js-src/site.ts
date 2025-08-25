// ==========================
//  site.ts  (HOST RUNTIME)
// ==========================

// ---- Contracts every RCL module follows ----
export interface PageModule {
    onInit(root: HTMLElement, host: HostPage): void | Promise<void>;
    /** Called when the same key + same module URL is rendered again (e.g., HTMX re-swap). */
    onUpdate?(newRoot: HTMLElement, host: HostPage, prevRoot?: HTMLElement): void | Promise<void>;
    onDestroy(): void | Promise<void>;
}

// ---- Record kept for each live module instance ----
type Loaded = {
    key: string;           // required, comes from data-key
    url: string;           // module URL from data-module
    el: HTMLElement;       // current root element
    instance: PageModule;  // class instance
};

// ---- Strongly-typed page host you can use anywhere via document.page ----
export class HostPage {
    /** Live list of loaded modules (one per data-key). */
    public readonly modules: Loaded[] = [];

    // Convenience lookups (manual casting is up to you)
    get(key: string): Loaded | undefined {
        return this.modules.find(m => m.key === key);
    }
    all(url?: string): Loaded[] {
        return url ? this.modules.filter(m => m.url === url) : [...this.modules];
    }
    cast<T extends PageModule>(key: string): T | undefined {
        return this.get(key)?.instance as T | undefined;
    }

    // Internal (used by runtime)
    _register(rec: Loaded) { this.modules.push(rec); }
    _unregisterByEl(el: HTMLElement) {
        const i = this.modules.findIndex(m => m.el === el);
        if (i >= 0) this.modules.splice(i, 1);
    }
}

// One host object per page lifetime
export const host = new HostPage();

// Make it globally accessible (and typed)
declare global {
    interface Document { page: HostPage; }
}
if (!(document as any).page) (document as any).page = host;

// ---- Helpers ----
const urlOf = (el: HTMLElement) => el.getAttribute('data-module') ?? '';
const keyOf = (el: HTMLElement) => el.getAttribute('data-key') ?? ''; // required by our scheme
const isRoot = (n: ParentNode): n is HTMLElement =>
    (n as Element).matches?.('[data-module]') ?? false;

function findRoots(container: ParentNode): HTMLElement[] {
    const list: HTMLElement[] = [];
    if (isRoot(container)) list.push(container);
    container.querySelectorAll?.('[data-module]')?.forEach(e => list.push(e as HTMLElement));
    return list;
}

function depth(el: Element) {
    let d = 0, n: Element | null = el;
    while (n) { d++; n = n.parentElement; }
    return d;
}

// Optional cache-buster (reads <meta name="app-version" content="..."> if present)
const APP_VER = (document.querySelector('meta[name="app-version"]') as HTMLMetaElement)?.content ?? '';
const withBust = (url: string) => APP_VER ? `${url}?v=${encodeURIComponent(APP_VER)}` : url;

// ---- Core ops ----
async function initNew(el: HTMLElement, url: string, key: string) {
    const mod = await import(withBust(url)); // browser caches by URL
    const Ctor = (mod.default ?? mod.Component ?? mod.Module) as (new () => PageModule) | undefined;
    if (typeof Ctor !== 'function') {
        console.warn(`[site] ${url} must export a class as default/Component/Module`);
        return;
    }
    const instance = new Ctor();
    await instance.onInit?.(el, host);
    host._register({ key, url, el, instance });
}

async function updateExisting(rec: Loaded, newEl: HTMLElement) {
    const prev = rec.el;       // old DOM node
    rec.el = newEl;            // point record to the new DOM node first
    if (typeof rec.instance.onUpdate === 'function') {
        await rec.instance.onUpdate(newEl, host, prev);
    }
    // If onUpdate is not implemented, we intentionally do nothing:
    // the instance keeps running with rec.el already updated.
}

async function destroyByEl(el: HTMLElement) {
    const rec = host.modules.find(m => m.el === el);
    if (!rec) return;
    try { await rec.instance.onDestroy?.(); }
    finally { host._unregisterByEl(el); }
}

/**
 * Reconcile modules under a container after DOM changes:
 * - If (key, url) unchanged: call onUpdate(newRoot, host, prevRoot) without destroy/reinit.
 * - If same key but url changed: destroy old, then init new.
 * - If new key: init new.
 * - If a previously tracked element under container is gone: destroy it.
 */
export async function reconcile(container: ParentNode = document) {
    const newRoots = findRoots(container);
    const seenKeys = new Set<string>();

    // Pass 1: create or update those present in DOM now
    for (const el of newRoots) {
        const url = urlOf(el);
        const key = keyOf(el);
        if (!url || !key) continue; // require both attributes
        seenKeys.add(key);

        const existing = host.get(key);
        if (existing) {
            if (existing.url === url) {
                await updateExisting(existing, el);
            } else {
                await destroyByEl(existing.el);
                await initNew(el, url, key);
            }
        } else {
            await initNew(el, url, key);
        }
    }

    // Pass 2: remove orphans in this subtree (child-first)
    const toRemove: HTMLElement[] = [];
    for (const rec of host.modules) {
        const inScope = container.contains(rec.el) || rec.el === container;
        if (!inScope) continue;
        const stillInDom = document.contains(rec.el);
        if (!stillInDom || !seenKeys.has(rec.key)) {
            toRemove.push(rec.el);
        }
    }
    // destroy deeper nodes first to avoid parent-before-child issues
    toRemove.sort((a, b) => depth(b) - depth(a));
    for (const el of toRemove) await destroyByEl(el);
}

// ---- Wire to lifecycle ----
document.addEventListener('DOMContentLoaded', () => { reconcile(document); });

// After HTMX swaps, reconcile the swapped target
document.body.addEventListener('htmx:afterSwap' as any, e => {
    reconcile(e.detail?.target || document);
});

// If your htmx version emits beforeCleanupElement when removing nodes,
// proactively destroy modules within that node (child-first).
document.body.addEventListener('htmx:beforeCleanupElement' as any, e => {
    const node = e.target as HTMLElement;
    const roots = findRoots(node).sort((a, b) => depth(b) - depth(a));
    roots.forEach(el => { void destroyByEl(el); });
});

// Optional: expose for console debugging
(Object.assign(window as any, { host }));
