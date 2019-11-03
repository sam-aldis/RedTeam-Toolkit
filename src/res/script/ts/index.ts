import {updateNotes} from './notes';
import { Terminal } from './term';
import { VimWasm } from 'vim-wasm';

const bootStrap = ()=>{
    const term = new Terminal();
    top.addEventListener("keydown", (ev : KeyboardEvent) => {
        term.handle_input(ev);
    });
    (document.getElementById("notes") as HTMLElement).onkeyup = ev=>{
        updateNotes();
    }
}
window.addEventListener("load", ()=>bootStrap());