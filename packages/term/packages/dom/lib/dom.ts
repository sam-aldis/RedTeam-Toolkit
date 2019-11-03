import { Commands } from 'commands';
import { customElement, html, LitElement, property } from 'lit-element';
import { ENV } from 'term';
import { Style } from './style';
export enum Themes {
    default = 1
}


@customElement("ukjp-terminal")
export class Termina extends LitElement {
    @property({type: Number}) theme : number = Themes.default; 
    line_buffer : Array<string> = [];
    @property({type: String}) histBuffer = ""; 
    private history_buffer : Array<any> = [];
    @property({type: String}) curBuffer : string; 
    isTerminal : boolean = false;
    public lineBuffer : string = "";
    std_out : Array<string> = [];
    line : number = 0;
    envs : ENV  = new ENV(window.localStorage);
    cmd : Commands = new Commands();
    constructor() {
        super();
        this.curBuffer = "";
        this.envs.init();
    }
    static get styles() {
        return Style;
    }
    private updateHistory() {
    this.history_buffer.push(html`<span>${this.curBuffer}</span>`);
        this.histBuffer += html`<span>${this.curBuffer}</span>`;
           }
    public write(msg: string) {
        let out = html`<b>${msg}</b>`;
        this.history_buffer.push(out);
        this.histBuffer += `${out}`;
    }
    public focus() {
        console.log("focus event"),
        this.isTerminal = true;
    }
    public handle_input(ev : KeyboardEvent) : void {
        if(this.isTerminal) {
            this.curBuffer = ((this.shadowRoot as ShadowRoot).getElementById("term_input") as HTMLInputElement).value;
                    switch(ev.keyCode) {
                        case 13:
                            this.updateHistory();
                            this.write(this.cmd.parse(this.curBuffer));
                            this.curBuffer = "";
                            this.line = 0;
                            break;
                    }
            } 
    }
    render() {
        let useTheme : string = "default";
        switch(this.theme) {
            case Themes.default:
                useTheme = "default";
                break;
        }
      return html`
        <section id="term" @mousedown="${this.focus}" class="${useTheme}" >
            <div id="terminal">
                <div id="history">${this.history_buffer.map(i=>html`<span>${i}</span><br />`)}</div>
                <span>
                    <div class="input">
                        <input id="term_input" .value=${this.curBuffer} autocomplete="off" autofocus @keyup=${this.handle_input} />
                    </div>
                    <div style="display: inline-block;">${this.curBuffer}</div><div class="cursor"></div>
                </span>
            </div>
        </section>
        `;

    }
}