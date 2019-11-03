import { Commands } from './commands';
import { FS_PATH, PATH } from './fs';
// typedef for Input and output to store info
type STD_IO = {
    timestamp? : Date,
    out : string,
    user? : string,
    working_dir? : string,
    extra? : {}
}
// default environment variables
type ENV_VARS = {
    CWD? : PATH;
    HISTORY? : Array<STD_IO>,
    PATH? : Array<PATH>,
    PKG_SOURCES? : PATH | URL | string
}

enum ENVS {
    CWD,
    HISTORY,
    PATH,
    PKG_SOURCES
}
interface ENV {
    init() : Object | boolean;
    update(env : ENVS, newVal : PATH | Array<STD_IO> | PATH | URL | string) : boolean;
    read(env : ENVS) : ENV_VARS | any;
    write(env : string, val : string) : boolean | Object;
}

class ENV implements ENV {
    private fs : IDBIndex;
    public DEFAULT_ENVS : ENV_VARS = {
        CWD : FS_PATH.fromString("/home/redteam"),
        HISTORY: new Array<STD_IO>({
            out: ""
        }),
        PATH : [FS_PATH.fromString('/apps/'),FS_PATH.fromString("/bin/")]
    }
    constructor(
        private storage : Storage, private indexdb? : IDBObjectStore
    ) {
        this.storage = <Storage>this.storage as Storage;
        (this.storage as Storage).setItem("SESSION_ID", btoa(Date.now().toString()).toString());
        this.fs = (this.indexdb as IDBObjectStore).createIndex("FS","term/fs");
    }
    init() : Object | boolean {
        this.storage.setItem("CWD",(this.DEFAULT_ENVS.CWD as PATH).path);
        this.storage.setItem("HISTORY","");
        this.storage.setItem("PATH",new String(this.DEFAULT_ENVS.PATH).toString());
        return this.DEFAULT_ENVS;
    }
}

export class Terminal {
    line_buffer : Array<string> = [];
    history_buffer : Array<string> = [];
    curBuffer = ""; 
    isTerminal : boolean = false;
    termElement : HTMLElement;
    std_out : Array<string> = [];
    line : number = 0;
    envs : ENV  = new ENV(window.localStorage);
    cmd : Commands = new Commands();
    constructor() {
        this.envs.init();
        this.termElement = (document.getElementById("term") as HTMLElement)
        this.line_buffer.forEach(element => {
            this.curBuffer += element;
        });
        this.termElement.addEventListener("mouseover", ()=>{
            this.isTerminal=true;
            console.log("enter");
        });
        this.termElement.onmouseleave = ()=>{
            this.isTerminal=false;
        }
        
    }
    private updateHistory(buffer : string) {
        this.history_buffer.push(this.curBuffer);
                            (document.getElementById("history") as HTMLElement).innerHTML = (document.getElementById("history") as HTMLElement).innerHTML + "<span>" + buffer + "</span><br />" ;
    }
    public write(msg: string) {
        let out = `<b>${msg}</b>`;
        this.std_out.push(out);
        this.updateHistory(out);
    }
    public handle_input(ev : KeyboardEvent) : void {
        if(this.isTerminal) {
            if(ev.key !== "Backspace") {
                if(ev.keyCode < 48) {
                    switch(ev.keyCode) {
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
                            if(this.line < this.history_buffer.length){
                                this.line += 1;
                                this.line_buffer = this.history_buffer[this.history_buffer.length - this.line].split("");
                            }
                            break;
                        case 40:
                            if(this.line > 1){
                                this.line -= 1;
                                this.line_buffer = this.history_buffer[this.history_buffer.length - this.line].split("");
                            } else {
                                this.line = 0;
                                this.line_buffer = [];
                            }
                            break;
                    }
                } else {
                    this.line_buffer.push(ev.key);
                }
            } else {
                this.line_buffer.pop();
            }
            let input = document.body.getElementsByClassName("input")[0];
            this.curBuffer = ""; 
            this.line_buffer.forEach(element => {
                this.curBuffer += element;
            });
            (input as HTMLElement).innerHTML = this.curBuffer;
        }
    }
}
    
    