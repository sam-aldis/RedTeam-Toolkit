import { LitElement, html, css, customElement} from 'lit-element';
import { VimWasm, VimWasmConstructOptions, VimWorker, ScreenCanvas} from 'vim-wasm';

class VimView extends VimWasm {
    public filename : string = `/tmp/${Date.now()}`;
    constructor(opts : VimWasmConstructOptions) {
        super(opts);

        this.onVimExit = status => {
            console.log(`Vim exited with status ${status}`);
            this.start()
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
        this.vim.start();
        return html`
            <link rel="stylesheet" href="vimpressive.css" />
            <canvas id="vim-screen"></canvas>
            <input id="vim-input" autocomplete="false" autofocus/>
            <script type="module" src="./vimdex.js"></script>
        `;
    }
}
customElements.define('vim-wasm',VimComponent);