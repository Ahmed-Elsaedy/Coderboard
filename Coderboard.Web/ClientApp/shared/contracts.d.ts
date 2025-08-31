// contracts.d.ts
// Ambient, compile-time only contracts used by Host runtime and RCL modules.
// No imports/exports — these are global types.

declare interface PageModule {
    onInit(root: HTMLElement, host: HostPage): void | Promise<void>;
    onUpdate?(newRoot: HTMLElement, host: HostPage, prevRoot?: HTMLElement): void | Promise<void>;
    onDestroy(): void | Promise<void>;

    // Fired when HTMX swaps anywhere *inside* this module (but not the module root itself)
    onInnerSwap?(
        target: HTMLElement,
        info: { isOob?: boolean; event?: any },
        host: HostPage
    ): void | Promise<void>;
}

declare interface Loaded {
    key: string;
    url: string;
    el: HTMLElement;
    instance: PageModule;
}

declare interface HostPage {
    modules: Loaded[];
    get(key: string): Loaded | undefined;
    all(url?: string): Loaded[];
    cast<T extends PageModule>(key: string): T | undefined;
    renderToast(): void;
}

declare interface Document {
    page: HostPage;
}

declare module "*base-page-module.js" {
    export abstract class BasePageModule implements PageModule {
        // public lifecycle (from PageModule)
        onInit(root: HTMLElement, host: HostPage): void | Promise<void>;
        onUpdate?(newRoot: HTMLElement, host: HostPage, prevRoot?: HTMLElement): void | Promise<void>;
        onDestroy(): void | Promise<void>;
        onInnerSwap?(
            target: HTMLElement,
            info: { isOob?: boolean; event?: any },
            host: HostPage
        ): void | Promise<void>;

        // protected/internal surface available to subclasses
        protected root: HTMLElement;
        protected host: HostPage;
        get element(): HTMLElement;
        get page(): HostPage;

        protected delegate<K extends keyof HTMLElementEventMap>(
            type: K,
            selector: string,
            handler: (ev: HTMLElementEventMap[K], matched: Element) => void,
            options?: AddEventListenerOptions
        ): void;

        protected on<K extends keyof HTMLElementEventMap>(
            target: Element | Document | Window,
            type: K,
            handler: (ev: HTMLElementEventMap[K]) => void,
            options?: AddEventListenerOptions
        ): void;

        protected qs<T extends Element = Element>(sel: string): T | null;
        protected qsa<T extends Element = Element>(sel: string): NodeListOf<T>;
    }
}
