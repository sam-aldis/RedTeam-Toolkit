export var FS_TYPES;
(function (FS_TYPES) {
    FS_TYPES[FS_TYPES["FILE"] = 0] = "FILE";
    FS_TYPES[FS_TYPES["BLOB"] = 1] = "BLOB";
    FS_TYPES[FS_TYPES["DIR"] = 2] = "DIR";
    FS_TYPES[FS_TYPES["DB"] = 3] = "DB";
    FS_TYPES[FS_TYPES["REPORT"] = 4] = "REPORT";
    FS_TYPES[FS_TYPES["FS"] = 5] = "FS";
    FS_TYPES[FS_TYPES["LIB"] = 6] = "LIB";
})(FS_TYPES || (FS_TYPES = {}));
export class FS_PATH {
    constructor(path) {
        this.path = path;
    }
    static fromString(str_path) {
        return {
            path: str_path,
            type: FS_TYPES.DIR
        };
    }
    mkdir(dirName) {
        // check they are creating a directory IN a directory
        if (this.path.type === FS_TYPES.DIR) {
            //TODO: Add new path to index db 
            return true;
        }
        return false;
    }
}
