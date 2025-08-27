// Ambient, compile-time only contracts used by Host runtime and RCL modules.
// No imports/exports needed.

declare interface PageModule {
  onInit(root: HTMLElement, host: HostPage): void | Promise<void>;
  onUpdate?(newRoot: HTMLElement, host: HostPage, prevRoot?: HTMLElement): void | Promise<void>;
  onDestroy(): void | Promise<void>;
}

declare interface Loaded {
  key: string;
  url: string;
  el: HTMLElement;
  instance: PageModule;
}

declare interface HostPage {
  /** Live list of loaded modules (one per data-key on the page). */
  modules: Loaded[];
  /** Find a module record by its data-key. */
  get(key: string): Loaded | undefined;
  /** All module records, optionally filtered by URL. */
  all(url?: string): Loaded[];
  /** Convenience: cast instance to your type (you provide the type). */
  cast<T extends PageModule>(key: string): T | undefined;
}

/** Global access (optional): document.page === HostPage singleton */
declare interface Document {
  page: HostPage;
}
