import { FS_PATH } from 'term-fs';
export var ENVS;
(function (ENVS) {
    ENVS[ENVS["CWD"] = 0] = "CWD";
    ENVS[ENVS["HISTORY"] = 1] = "HISTORY";
    ENVS[ENVS["PATH"] = 2] = "PATH";
    ENVS[ENVS["PKG_SOURCES"] = 3] = "PKG_SOURCES";
})(ENVS || (ENVS = {}));
export class ENV {
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
        // this.fs = (this.indexdb as IDBObjectStore).createIndex("FS","term/fs");
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
    }
}
