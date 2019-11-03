import { updateNotes } from './notes';
import { Terminal } from './term';
const bootStrap = () => {
    const term = new Terminal();
    top.addEventListener("keydown", (ev) => {
        term.handle_input(ev);
    });
    document.getElementById("notes").onkeyup = ev => {
        updateNotes();
    };
};
window.addEventListener("load", () => bootStrap());
