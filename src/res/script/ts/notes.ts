import { Marked } from 'marked-ts';
import { highlight } from 'highlight.js';

Marked.setOptions({highlight: (code, lang) => highlight(lang as string, code).value});
export const updateNotes = ()=> {
    let md = (document.getElementById("notes") as HTMLTextAreaElement).value as string;
    let out = Marked.parse(md);
    (document.getElementById('notesOut') as HTMLElement).innerHTML = out;
}