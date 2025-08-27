export default class Login implements PageModule {
    private ac?: AbortController;
    onInit(root: HTMLElement, host: HostPage) {
        /* wire with {signal: ac.signal} */
        console.log("onInit");
    }
    onUpdate(root: HTMLElement, host: HostPage, prev?: HTMLElement) {
        /* abort old, rewire */
        console.log("onUpdate");

    }
    onDestroy() {
        console.log("onDestroy");

        /* abort & cleanup */
    }
}
