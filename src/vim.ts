import { LitElement, html, css, customElement} from 'lit-element';
import { VimWasm, VimWasmConstructOptions, VimWorker, ScreenCanvas} from 'vim-wasm';

class VimView extends VimWasm {
    public filename : string = `/tmp/${Date.now()}`;
    constructor(opts : VimWasmConstructOptions) {
        super(opts);
    }
    async Save() {
        localStorage.setItem(this.filename,'saved');
    }
}


class VimComponent extends LitElement {
    public opts : VimWasmConstructOptions = {
        canvas : (document.getElementById('vim-screen') as HTMLCanvasElement),
        input :  (document.getElementById('vim-input') as HTMLInputElement),
        workerScriptPath : './vim.worker.js'
    };
    vim : VimView = new VimView(this.opts)
    constructor() {
        super();
    }
    render() {
        return html`
            <link rel="stylesheet" href="vimpressive.css" />
            <canvas id="vim-screen"></canvas>
            <input id="vim-input" autocomplete="false" autofocus/>
            <script type="module" src="./vimdex.js"></script>
        `;
    }
}
customElements.define('vim-wasm',VimComponent);