import { Commands } from './commands';
import { FS_PATH } from './fs';
var ENVS;
(function (ENVS) {
    ENVS[ENVS["CWD"] = 0] = "CWD";
    ENVS[ENVS["HISTORY"] = 1] = "HISTORY";
    ENVS[ENVS["PATH"] = 2] = "PATH";
    ENVS[ENVS["PKG_SOURCES"] = 3] = "PKG_SOURCES";
})(ENVS || (ENVS = {}));
class ENV {
    constructor(storage, indexdb) {
        this.storage = storage;
        this.indexdb = indexdb;
        this.DEFAULT_ENVS = {
            CWD: FS_PATH.fromString("/home/redteam"),
            HISTORY: new Array({
                out: ""
            }),
            PATH: [FS_PATH.fromString('/apps/'), FS_PATH.fromString("/bin/")]
        };
        this.storage = this.storage;
        this.storage.setItem("SESSION_ID", btoa(Date.now().toString()).toString());
        this.fs = this.indexdb.createIndex("FS", "term/fs");
    }
    init() {
        this.storage.setItem("CWD", this.DEFAULT_ENVS.CWD.path);
        this.storage.setItem("HISTORY", "");
        this.storage.setItem("PATH", new String(this.DEFAULT_ENVS.PATH).toString());
        return this.DEFAULT_ENVS;
    }
}
export class Terminal {
    constructor() {
        this.line_buffer = [];
        this.history_buffer = [];
        this.curBuffer = "";
        this.isTerminal = false;
        this.std_out = [];
        this.line = 0;
        this.envs = new ENV(window.localStorage);
        this.cmd = new Commands();
        this.envs.init();
        this.termElement = document.getElementById("term");
        this.line_buffer.forEach(element => {
            this.curBuffer += element;
        });
        this.termElement.addEventListener("mouseover", () => {
            this.isTerminal = true;
            console.log("enter");
        });
        this.termElement.onmouseleave = () => {
            this.isTerminal = false;
        };
    }
    updateHistory(buffer) {
        this.history_buffer.push(this.curBuffer);
        document.getElementById("history").innerHTML = document.getElementById("history").innerHTML + "<span>" + buffer + "</span><br />";
    }
    write(msg) {
        let out = `<b>${msg}</b>`;
        this.std_out.push(out);
        this.updateHistory(out);
    }
    handle_input(ev) {
        if (this.isTerminal) {
            if (ev.key !== "Backspace") {
                if (ev.keyCode < 48) {
                    switch (ev.keyCode) {
                        case 32:
                            this.line_buffer.push(ev.key);
                            break;
                        case 13:
                            this.updateHistory(this.curBuffer);
                            this.write(this.cmd.parse(this.curBuffer));
                            this.line_buffer = [];
                            this.line = 0;
                            break;
                        case 38:
                            if (this.line < this.history_buffer.length) {
                                this.line += 1;
                                this.line_buffer = this.history_buffer[this.history_buffer.length - this.line].split("");
                            }
                            break;
                        case 40:
                            if (this.line > 1) {
                                this.line -= 1;
                                this.line_buffer = this.history_buffer[this.history_buffer.length - this.line].split("");
                            }
                            else {
                                this.line = 0;
                                this.line_buffer = [];
                            }
                            break;
                    }
                }
                else {
                    this.line_buffer.push(ev.key);
                }
            }
            else {
                this.line_buffer.pop();
            }
            let input = document.body.getElementsByClassName("input")[0];
            this.curBuffer = "";
            this.line_buffer.forEach(element => {
                this.curBuffer += element;
            });
            input.innerHTML = this.curBuffer;
        }
    }
}
