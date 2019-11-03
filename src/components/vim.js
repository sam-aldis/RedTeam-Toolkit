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
        this.onVimExit = status => {
            console.log(`Vim exited with status ${status}`);
            this.start();
        };
        this.onFileExport = (fullpath, contents) => {
            const slashIdx = fullpath.lastIndexOf('/');
            const filename = slashIdx !== -1 ? fullpath.slice(slashIdx + 1) : fullpath;
            const blob = new Blob([contents], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.rel = 'noopener';
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        this.readClipboard = navigator.clipboard.readText;
        this.onWriteClipboard = navigator.clipboard.writeText;
        this.onError = console.error;
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
        this.vim.start();
        return html `
            <link rel="stylesheet" href="vimpressive.css" />
            <canvas id="vim-screen"></canvas>
            <input id="vim-input" autocomplete="false" autofocus/>
            <script type="module" src="./vimdex.js"></script>
        `;
    }
}
customElements.define('vim-wasm', VimComponent);
