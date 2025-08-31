// base-page-module.ts
export abstract class BasePageModule implements PageModule {
    // internal state (protected so subclasses can use them)
    protected root!: HTMLElement;
    protected host!: HostPage;
    private ac: AbortController | null = null;

    // public, read-only accessors (optional but handy)
    get element(): HTMLElement { return this.root; }
    get page(): HostPage { return this.host; }

    // ---- lifecycle (public) ----
    async onInit(root: HTMLElement, host: HostPage): Promise<void> {
        this.host = host;
        this.root = root;
        this.resetAbortController();
        await this.init(root);
    }

    async onUpdate(newRoot: HTMLElement, host: HostPage, prevRoot?: HTMLElement): Promise<void> {
        this.host = host;
        this.root = newRoot;
        this.resetAbortController();
        await this.update(newRoot, prevRoot);
    }

    async onDestroy(): Promise<void> {
        this.ac?.abort(); this.ac = null;
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
    protected async init(_root: HTMLElement): Promise<void> { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async update(_root: HTMLElement, _prev?: HTMLElement): Promise<void> { }
    protected async destroy(): Promise<void> { }

    // ---- utilities (protected) ----
    protected delegate<K extends keyof HTMLElementEventMap>(
        type: K,
        selector: string,
        handler: (ev: HTMLElementEventMap[K], matched: Element) => void,
        options?: AddEventListenerOptions
    ): void {
        const root = this.ensureRoot();
        root.addEventListener(
            type as string,
            (ev: Event) => {
                const origin = ev.target as Element | null;
                if (!origin) return;
                const matched = origin.closest(selector);
                if (matched && root.contains(matched)) handler(ev as HTMLElementEventMap[K], matched);
            },
            { ...options, signal: this.signal }
        );
    }

    protected on<K extends keyof HTMLElementEventMap>(
        target: Element | Document | Window,
        type: K,
        handler: (ev: HTMLElementEventMap[K]) => void,
        options?: AddEventListenerOptions
    ): void {
        (target as any).addEventListener(type as string, handler as any, { ...options, signal: this.signal });
    }

    protected qs<T extends Element = Element>(sel: string): T | null {
        return this.ensureRoot().querySelector<T>(sel);
    }
    protected qsa<T extends Element = Element>(sel: string): NodeListOf<T> {
        return this.ensureRoot().querySelectorAll<T>(sel);
    }

    // ---- internals ----
    private resetAbortController() { this.ac?.abort(); this.ac = new AbortController(); }
    private get signal(): AbortSignal { if (!this.ac) this.ac = new AbortController(); return this.ac.signal; }
    protected ensureRoot(): HTMLElement {
        if (!this.root) throw new Error("onInit not run yet");
        return this.root;
    }
}
