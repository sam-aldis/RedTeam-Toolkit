export declare type PERMS = {
    read: {
        owner: boolean;
        all: boolean;
    };
    write: {
        owner: boolean;
        all: boolean;
    };
    execute: {
        owner: boolean;
        all: boolean;
    };
    owner: string;
};
export declare enum FS_TYPES {
    FILE = 0,
    BLOB = 1,
    DIR = 2,
    DB = 3,
    REPORT = 4,
    FS = 5,
    LIB = 6
}
export declare type PATH = {
    path: string;
    url?: URL;
    relPath?: string;
    dirPerms?: PERMS;
    type: FS_TYPES;
};
export declare class FS_PATH {
    private path;
    constructor(path: PATH);
    static fromString(str_path: string): PATH;
    mkdir(dirName: PATH): boolean;
}
