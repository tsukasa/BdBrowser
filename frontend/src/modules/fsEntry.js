import Buffer from "./buffer";
import path from "./path";

export default class VfsEntry {
    constructor(fullName, nodeType) {
        this.fullName = fullName;
        this.pathName = path.dirname(this.fullName);
        this.nodeType = nodeType;
    }

    fullName = "";
    pathName = "";
    nodeType = undefined;
    birthtime = Date.now();
    atime = Date.now();
    ctime = Date.now();
    mtime = Date.now();
    contents = new Buffer([]);
    size = 0;
}
