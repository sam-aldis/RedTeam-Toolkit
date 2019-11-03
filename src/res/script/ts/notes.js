import { Marked } from 'marked-ts';
import { highlight } from 'highlight.js';
Marked.setOptions({ highlight: (code, lang) => highlight(lang, code).value });
export const updateNotes = () => {
    let md = document.getElementById("notes").value;
    let out = Marked.parse(md);
    document.getElementById('notesOut').innerHTML = out;
};
