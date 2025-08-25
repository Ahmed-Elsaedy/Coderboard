export default class Login implements PageModule {
    private ac?: AbortController;
    onInit(root: HTMLElement, host: HostPage) {
        /* wire with {signal: ac.signal} */
    }
    onUpdate(root: HTMLElement, host: HostPage, prev?: HTMLElement) {
        /* abort old, rewire */
    }
    onDestroy() {
        /* abort & cleanup */
    }
}
