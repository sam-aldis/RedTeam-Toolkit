import { FS_PATH, PATH } from 'term-fs';
// typedef for Input and output to store info
export type STD_IO = {
    timestamp? : Date,
    out : string,
    user? : string,
    working_dir? : string,
    extra? : {}
}
// default environment variables
export type ENV_VARS = {
    CWD? : PATH;
    HISTORY? : Array<STD_IO>,
    PATH? : Array<PATH>,
    PKG_SOURCES? : PATH | URL | string
}

export enum ENVS {
    CWD,
    HISTORY,
    PATH,
    PKG_SOURCES
}
export interface ENV {
    init() : Object | boolean;
    update(env : ENVS, newVal : PATH | Array<STD_IO> | PATH | URL | string) : boolean;
    read(env : ENVS) : ENV_VARS | any;
    write(env : string, val : string) : boolean | Object;
}

export class ENV implements ENV {
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
        // this.fs = (this.indexdb as IDBObjectStore).createIndex("FS","term/fs");
    }
    init() : Object | boolean {
        this.storage.setItem("CWD",(this.DEFAULT_ENVS.CWD as PATH).path);
        this.storage.setItem("HISTORY","");
        this.storage.setItem("PATH",new String(this.DEFAULT_ENVS.PATH).toString());
        return this.DEFAULT_ENVS;
    }
}

export class Terminal {
       constructor() {
    }
    

}
    
    