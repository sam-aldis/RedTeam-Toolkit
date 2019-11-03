var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { Commands } from "../node_modules/commands/lib/commands.js";
import { customElement, html, LitElement, property } from "../node_modules/lit-element/lit-element.js";
import { ENV } from "../node_modules/term/lib/term.js";
import { Style } from "./style.js";
export var Themes;

(function (Themes) {
  Themes[Themes["default"] = 1] = "default";
})(Themes || (Themes = {}));

let Termina = class Termina extends LitElement {
  constructor() {
    super();
    this.theme = Themes.default;
    this.line_buffer = [];
    this.histBuffer = "";
    this.history_buffer = [];
    this.isTerminal = false;
    this.lineBuffer = "";
    this.std_out = [];
    this.line = 0;
    this.envs = new ENV(window.localStorage);
    this.cmd = new Commands();
    this.curBuffer = "";
    this.envs.init();
  }

  static get styles() {
    return Style;
  }

  updateHistory() {
    this.history_buffer.push(this.curBuffer);
    this.histBuffer += `<span>${this.curBuffer}</span>`;
  }

  write(msg) {
    let out = html`<b>${msg}</b>`;
    this.history_buffer.push(out);
    this.histBuffer += `<span>${out}</span>`;
  }

  focus() {
    console.log("focus event"), this.isTerminal = true;
  }

  handle_input(ev) {
    if (this.isTerminal) {
      this.curBuffer = this.shadowRoot.getElementById("term_input").value;

      switch (ev.keyCode) {
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
    let useTheme = "default";

    switch (this.theme) {
      case Themes.default:
        useTheme = "default";
        break;
    }

    return html`
        <section id="term" @mousedown="${this.focus}" class="${useTheme}" >
            <div id="terminal">
                <div id="history">${this.history_buffer.map(i => html`<span>${i}</span><br />`)}</div>
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

};

__decorate([property({
  type: Number
})], Termina.prototype, "theme", void 0);

__decorate([property({
  type: String
})], Termina.prototype, "histBuffer", void 0);

__decorate([property({
  type: String
})], Termina.prototype, "curBuffer", void 0);

Termina = __decorate([customElement("ukjp-terminal")], Termina);
export { Termina };