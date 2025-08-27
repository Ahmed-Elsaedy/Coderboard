// site.ts — HOST RUNTIME (uses ambient types from shared contracts)

class HostPageImpl implements HostPage {
    public readonly modules: Loaded[] = [];
    get(key: string) { return this.modules.find(m => m.key === key); }
    all(url?: string) { return url ? this.modules.filter(m => m.url === url) : [...this.modules]; }
    cast<T extends PageModule>(key: string) { return this.get(key)?.instance as T | undefined; }
    _register(rec: Loaded) { this.modules.push(rec); }
    _unregisterByEl(el: HTMLElement) {
        const i = this.modules.findIndex(m => m.el === el);
        if (i >= 0) this.modules.splice(i, 1);
    }
}

// Singleton host for this page
export const host: HostPage = new HostPageImpl() as HostPage;

// Expose globally (typed by shared contracts)
declare global { interface Document { page: HostPage; } }
if (!(document as any).page) (document as any).page = host;

// ---------- helpers ----------
const urlOf = (el: HTMLElement) => el.getAttribute('data-module') ?? '';
const keyOf = (el: HTMLElement) => el.getAttribute('data-key') ?? ''; // REQUIRED
const isRoot = (n: ParentNode): n is HTMLElement => (n as Element).matches?.('[data-module]') ?? false;

function findRoots(container: ParentNode): HTMLElement[] {
    const out: HTMLElement[] = [];
    if (isRoot(container)) out.push(container);
    container.querySelectorAll?.('[data-module]')?.forEach(e => out.push(e as HTMLElement));
    return out;
}
function depth(el: Element) { let d = 0, n: Element | null = el; while (n) { d++; n = n.parentElement; } return d; }

const APP_VER = (document.querySelector('meta[name="app-version"]') as HTMLMetaElement)?.content ?? '';
const withBust = (u: string) => APP_VER ? `${u}?v=${encodeURIComponent(APP_VER)}` : u;

// ---------- core ----------
async function initNew(el: HTMLElement, url: string, key: string) {
    const mod = await import(withBust(url));
    const Ctor = (mod.default ?? mod.Component ?? mod.Module) as (new () => PageModule) | undefined;
    if (typeof Ctor !== 'function') { console.warn(`[site] ${url} must export a class as default/Component/Module`); return; }
    const instance = new Ctor();
    await instance.onInit?.(el, host);
    (host as any)._register({ key, url, el, instance } as Loaded);
}

async function updateExisting(rec: Loaded, newEl: HTMLElement) {
    const prev = rec.el;
    rec.el = newEl;
    if (typeof rec.instance.onUpdate === 'function') {
        await rec.instance.onUpdate(newEl, host, prev);
    }
}

async function destroyByEl(el: HTMLElement) {
    const list = host.modules;
    const rec = list.find(m => m.el === el);
    if (!rec) return;
    try { await rec.instance.onDestroy?.(); }
    finally { (host as any)._unregisterByEl(el); }
}

export async function reconcile(container: ParentNode = document) {
    const newRoots = findRoots(container);
    const seen = new Set<string>();

    // create/update
    for (const el of newRoots) {
        const url = urlOf(el), key = keyOf(el);
        if (!url || !key) continue;
        seen.add(key);
        const existing = host.get(key);
        if (existing) {
            if (existing.url === url) await updateExisting(existing, el);
            else { await destroyByEl(existing.el); await initNew(el, url, key); }
        } else {
            await initNew(el, url, key);
        }
    }

    // remove orphans (child-first)
    const toRemove: HTMLElement[] = [];
    for (const rec of host.modules) {
        const inScope = container.contains(rec.el) || rec.el === container;
        if (!inScope) continue;
        const stillInDom = document.contains(rec.el);
        if (!stillInDom || !seen.has(rec.key)) toRemove.push(rec.el);
    }
    toRemove.sort((a, b) => depth(b) - depth(a));
    for (const el of toRemove) await destroyByEl(el);
}

// wire up
document.addEventListener('DOMContentLoaded', () => { reconcile(document); });
document.body.addEventListener('htmx:afterSwap' as any, e => { reconcile(e.detail?.target || document); });
document.body.addEventListener('htmx:beforeCleanupElement' as any, e => {
    const node = e.target as HTMLElement;
    const roots = findRoots(node).sort((a, b) => depth(b) - depth(a));
    roots.forEach(el => { void destroyByEl(el); });
});

// optional debug handle
(Object.assign(window as any, { host }));
