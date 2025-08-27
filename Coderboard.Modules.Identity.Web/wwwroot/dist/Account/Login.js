export default class Login {
    onInit(root, host) {
        /* wire with {signal: ac.signal} */
        console.log("onInit");
    }
    onUpdate(root, host, prev) {
        /* abort old, rewire */
        console.log("onUpdate");
    }
    onDestroy() {
        console.log("onDestroy");
        /* abort & cleanup */
    }
}
//# sourceMappingURL=Login.js.map