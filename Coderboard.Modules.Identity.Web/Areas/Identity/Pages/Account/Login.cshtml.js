import { BasePageModule } from "/dist/shared/base-page-module.js";
export default class Login extends BasePageModule {
    async init(root) {
        console.log('init');
    }
    async update(root) {
        console.log('update');
    }
    async destroy() {
        console.log('destroy');
    }
    onInnerSwap(target) { }
}
//# sourceMappingURL=Login.cshtml.js.map