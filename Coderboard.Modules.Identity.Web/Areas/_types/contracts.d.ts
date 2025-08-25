declare interface PageModule {
    onInit(root: HTMLElement, host: HostPage): void | Promise<void>;
    onUpdate?(root: HTMLElement, host: HostPage): void | Promise<void>;
    onDestroy(): void | Promise<void>;
}
declare interface HostPage {
    modules: Array<{ key: string; url: string; el: HTMLElement; instance: PageModule }>;
    get(key: string): { key: string; url: string; el: HTMLElement; instance: PageModule } | undefined;
    all(url?: string): Array<{ key: string; url: string; el: HTMLElement; instance: PageModule }>;
    cast<T extends PageModule>(key: string): T | undefined;
}
declare interface Document { page: HostPage; }
