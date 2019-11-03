import { Commands } from './commands';
import { PATH } from './fs';
declare type STD_IO = {
    timestamp?: Date;
    out: string;
    user?: string;
    working_dir?: string;
    extra?: {};
};
declare type ENV_VARS = {
    CWD?: PATH;
    HISTORY?: Array<STD_IO>;
    PATH?: Array<PATH>;
    PKG_SOURCES?: PATH | URL | string;
};
declare enum ENVS {
    CWD = 0,
    HISTORY = 1,
    PATH = 2,
    PKG_SOURCES = 3
}
interface ENV {
    init(): Object | boolean;
    update(env: ENVS, newVal: PATH | Array<STD_IO> | PATH | URL | string): boolean;
    read(env: ENVS): ENV_VARS | any;
    write(env: string, val: string): boolean | Object;
}
declare class ENV implements ENV {
    private storage;
    private indexdb?;
    private fs;
    DEFAULT_ENVS: ENV_VARS;
    constructor(storage: Storage, indexdb?: IDBObjectStore | undefined);
}
export declare class Terminal {
    line_buffer: Array<string>;
    history_buffer: Array<string>;
    curBuffer: string;
    isTerminal: boolean;
    termElement: HTMLElement;
    std_out: Array<string>;
    line: number;
    envs: ENV;
    cmd: Commands;
    constructor();
    private updateHistory;
    write(msg: string): void;
    handle_input(ev: KeyboardEvent): void;
}
export {};
