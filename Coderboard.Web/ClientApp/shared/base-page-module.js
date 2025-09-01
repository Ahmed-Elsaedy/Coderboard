// base-page-module.ts
export class BasePageModule {
    constructor() {
        this.ac = null;
    }
    // public, read-only accessors (optional but handy)
    get element() { return this.root; }
    get page() { return this.host; }
    // ---- lifecycle (public) ----
    async onInit(root, host) {
        this.host = host;
        this.root = root;
        this.resetAbortController();
        await this.init(root);
    }
    async onUpdate(newRoot, host, prevRoot) {
        this.host = host;
        this.root = newRoot;
        this.resetAbortController();
        await this.update(newRoot, prevRoot);
    }
    async onDestroy() {
        this.ac?.abort();
        this.ac = null;
        await this.destroy();
        // help GC
        // @ts-expect-error intentional clear
        this.root = undefined;
        // @ts-expect-error intentional clear
        this.host = undefined;
    }
    // optional hook; subclass may override
    // onInnerSwap?(target: HTMLElement, info: { isOob?: boolean; event?: any }, host: HostPage): void | Promise<void>;
    // ---- subclass extension points (protected) ----
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async init(_root) { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(_root, _prev) { }
    async destroy() { }
    // ---- utilities (protected) ----
    delegate(type, selector, handler, options) {
        const root = this.ensureRoot();
        root.addEventListener(type, (ev) => {
            const origin = ev.target;
            if (!origin)
                return;
            const matched = origin.closest(selector);
            if (matched && root.contains(matched))
                handler(ev, matched);
        }, { ...options, signal: this.signal });
    }
    on(target, type, handler, options) {
        target.addEventListener(type, handler, { ...options, signal: this.signal });
    }
    qs(sel) {
        return this.ensureRoot().querySelector(sel);
    }
    qsa(sel) {
        return this.ensureRoot().querySelectorAll(sel);
    }
    // ---- internals ----
    resetAbortController() { this.ac?.abort(); this.ac = new AbortController(); }
    get signal() { if (!this.ac)
        this.ac = new AbortController(); return this.ac.signal; }
    ensureRoot() {
        if (!this.root)
            throw new Error("onInit not run yet");
        return this.root;
    }
}
