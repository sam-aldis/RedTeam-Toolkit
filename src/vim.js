var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LitElement, html } from 'lit-element';
import { VimWasm } from 'vim-wasm';
class VimView extends VimWasm {
    constructor(opts) {
        super(opts);
        this.filename = `/tmp/${Date.now()}`;
    }
    Save() {
        return __awaiter(this, void 0, void 0, function* () {
            localStorage.setItem(this.filename, 'saved');
        });
    }
}
class VimComponent extends LitElement {
    constructor() {
        super();
        this.opts = {
            canvas: document.getElementById('vim-screen'),
            input: document.getElementById('vim-input'),
            workerScriptPath: './vim.worker.js'
        };
        this.vim = new VimView(this.opts);
    }
    render() {
        return html `
            <link rel="stylesheet" href="vimpressive.css" />
            <canvas id="vim-screen"></canvas>
            <input id="vim-input" autocomplete="false" autofocus/>
            <script type="module" src="./vimdex.js"></script>
        `;
    }
}
customElements.define('vim-wasm', VimComponent);
