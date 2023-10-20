import buffer from "node_shims/buffer";
import path from "node_shims/path";

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
    contents = new buffer.Buffer([]);
    size = 0;
}
