declare var Handlebars: any;
class HostPageImpl implements HostPage {
    public readonly modules: Loaded[] = [];
    private toastTemplate: any = null;

    constructor() {
        this.registerToastTemplate();

        document.addEventListener('DOMContentLoaded', () => { this.reconcile(document); });

        // Reconcile then notify modules for inner swaps
        ['htmx:afterSwap', 'htmx:oobAfterSwap'].forEach(evt =>
            document.body.addEventListener(evt as any, async e => {
                const t = e.detail?.target as HTMLElement | null;
                await this.reconcile(t || document);
                if (!t) return;
                if (t.matches?.('[data-module]')) return; // module-level handled by onUpdate
                const rec = this.owningModuleOf(t); if (!rec) return;
                const fn = rec.instance.onInnerSwap?.bind(rec.instance);
                if (fn) {
                    try { await fn(t, { isOob: evt.includes('oob'), event: e.detail }, host); }
                    catch (err) { console.error('[site] onInnerSwap error:', err); }
                }
            })
        );

        // Destroy modules if HTMX cleans a subtree
        document.body.addEventListener('htmx:beforeCleanupElement' as any, e => {
            const node = e.target as HTMLElement;
            const roots = this.findRoots(node).sort((a, b) => this.depth(b) - this.depth(a));
            roots.forEach(el => { void this.destroyByEl(el); });
        });

        // htmx → automatic error toasts
        document.body.addEventListener('htmx:responseError', (e: any) => {
            let msg = 'Something went wrong.', st = e.detail.xhr.status;
            try {
                const ct = e.detail.xhr.getResponseHeader('Content-Type') || '';
                if (ct.includes('application/json')) {
                    const data = JSON.parse(e.detail.xhr.responseText || '{}');
                    msg = data.message || data.title || msg;
                }
            } catch { }
            this.renderToast({ type: 'error', title: `Error ${st}`, message: msg });
        });

        document.body.addEventListener('htmx:sendError', () => {
            this.renderToast({ type: 'error', title: 'Network error', message: 'Please try again.' });
        });

        // Response.Headers["HX-Trigger"] = JsonSerializer.Serialize(new { toast = new { type="success", title="Saved", message="Done." }});
        document.body.addEventListener('toast', (e: any) => this.renderToast(e.detail || {}));
    }

    public get(key: string) { return this.modules.find(m => m.key === key); }
    public all(url?: string) { return url ? this.modules.filter(m => m.url === url) : [...this.modules]; }
    public cast<T extends PageModule>(key: string) { return this.get(key)?.instance as T | undefined; }

    private _register(rec: Loaded) { this.modules.push(rec); }
    private _unregisterByEl(el: HTMLElement) {
        const i = this.modules.findIndex(m => m.el === el);
        if (i >= 0) this.modules.splice(i, 1);
    }

    public renderToast({ type = 'info', title = '', message = '', timeout = 4000 } = {}): void {
        const host = document.getElementById('toasts');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.toastTemplate({ type, title, message });
        const el = wrapper.firstElementChild;
        host!.appendChild(el!);

        // enter/exit animation (class toggles only)
        requestAnimationFrame(() => {
            el!.classList.remove('translate-y-2', 'opacity-0');
            el!.classList.add('translate-y-0', 'opacity-100');
        });
        const remove = () => { el!.classList.add('translate-y-2', 'opacity-0'); setTimeout(() => el!.remove(), 180); };
        el!.querySelector('button[aria-label="Close"]')!.addEventListener('click', remove);
        const t = setTimeout(remove, timeout);
        el!.addEventListener('pointerenter', () => clearTimeout(t));
    }

    private registerToastTemplate(): void {
        Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
        (async () => {
            const res = await fetch('/templates/toast.hbs', { cache: 'force-cache' });
            const src = await res.text();
            this.toastTemplate = Handlebars.compile(src);
        })();
        // Response.Headers["HX-Trigger"] = JsonSerializer.Serialize(new { toast = new { type="success", title="Saved", message="Done." }});
    }

    private urlOf = (el: HTMLElement) => el.getAttribute('data-module') ?? '';
    private keyOf = (el: HTMLElement) => el.getAttribute('data-key') ?? '';
    private isRoot = (n: ParentNode): n is HTMLElement => (n as Element).matches?.('[data-module]') ?? false;
    private APP_VER = (document.querySelector('meta[name="app-version"]') as HTMLMetaElement)?.content ?? '';
    private withBust = (u: string) => this.APP_VER ? `${u}?v=${encodeURIComponent(this.APP_VER)}` : u;

    private findRoots(container: ParentNode): HTMLElement[] {
        const out: HTMLElement[] = [];
        if (this.isRoot(container)) out.push(container);
        container.querySelectorAll?.('[data-module]')?.forEach(e => out.push(e as HTMLElement));
        return out;
    }
    private depth(el: Element) { let d = 0, n: Element | null = el; while (n) { d++; n = n.parentElement; } return d; }
    private owningModuleOf(node: HTMLElement): Loaded | undefined {
        const root = node.closest('[data-module]') as HTMLElement | null;
        if (!root) return;
        return host.modules.find(m => m.el === root);
    }


    private async initNew(el: HTMLElement, url: string, key: string) {
        const mod = await import(this.withBust(url));
        const Ctor = (mod.default ?? mod.Component ?? mod.Module) as (new () => PageModule) | undefined;
        if (typeof Ctor !== 'function') { console.warn(`[site] ${url} must export a class as default/Component/Module`); return; }
        const instance = new Ctor();
        await instance.onInit?.(el, host);
        (host as any)._register({ key, url, el, instance } as Loaded);
    }

    private async updateExisting(rec: Loaded, newEl: HTMLElement) {
        const prev = rec.el;
        rec.el = newEl;
        if (typeof rec.instance.onUpdate === 'function') {
            await rec.instance.onUpdate(newEl, host, prev);
        }
    }

    private async destroyByEl(el: HTMLElement) {
        const rec = host.modules.find(m => m.el === el); if (!rec) return;
        try { await rec.instance.onDestroy?.(); }
        finally { (host as any)._unregisterByEl(el); }
    }

    private async reconcile(container: ParentNode = document) {
        const newRoots = this.findRoots(container);
        const seen = new Set<string>();
        for (const el of newRoots) {
            const url = this.urlOf(el), key = this.keyOf(el);
            if (!url || !key) continue;
            seen.add(key);
            const existing = host.get(key);
            if (existing) {
                if (existing.url === url) await this.updateExisting(existing, el);
                else { await this.destroyByEl(existing.el); await this.initNew(el, url, key); }
            } else {
                await this.initNew(el, url, key);
            }
        }
        const toRemove: HTMLElement[] = [];
        for (const rec of host.modules) {
            const inScope = container.contains(rec.el) || rec.el === container;
            if (!inScope) continue;
            const stillInDom = document.contains(rec.el);
            if (!stillInDom || !seen.has(rec.key)) toRemove.push(rec.el);
        }
        toRemove.sort((a, b) => this.depth(b) - this.depth(a));
        for (const el of toRemove) await this.destroyByEl(el);
    }
}

export const host: HostPage = new HostPageImpl() as HostPage;
declare global { interface Document { page: HostPage; } }
if (!(document as any).page) (document as any).page = host;

// optional debug
(Object.assign(window as any, { host }));