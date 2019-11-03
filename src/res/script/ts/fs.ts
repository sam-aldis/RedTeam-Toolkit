export type PERMS = {
    read : {
        owner : boolean,
        all : boolean
    },
    write : {
        owner : boolean,
        all : boolean
    },
    execute : {
        owner : boolean,
        all : boolean
    },
    owner : string
}
export enum FS_TYPES {
    FILE,
    BLOB,
    DIR,
    DB,
    REPORT,
    FS,
    LIB
}
export type PATH = {
    path : string,
    url? : URL,
    relPath? : string,
    dirPerms? : PERMS,
    type: FS_TYPES
}
export class FS_PATH {
    constructor(private path : PATH) {

    }
    static fromString(str_path : string) : PATH {
        return <PATH>{
            path : str_path,
            type : FS_TYPES.DIR
        };
    }
    mkdir(dirName : PATH) : boolean {
        // check they are creating a directory IN a directory
        if(this.path.type === FS_TYPES.DIR) {
            //TODO: Add new path to index db 
            return true;
        }
        return false;
    }
}
