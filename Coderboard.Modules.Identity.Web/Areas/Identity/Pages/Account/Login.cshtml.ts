import { BasePageModule } from "/dist/shared/base-page-module.js";

export default class Login extends BasePageModule {
    protected async init(root: HTMLElement) {
        console.log('init');
    }

    protected async update(root: HTMLElement) {
        console.log('update');
    }

    protected async destroy() {
        console.log('destroy');

    }

    onInnerSwap(target: HTMLElement) { }
}
