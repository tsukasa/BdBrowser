import electron from "./electron";
import fs from "./fs";
import https from "./https";
import path from "./path";

export default {
    electron: electron,
    filesystem: {
        readFile: fs.readFileSync,
        writeFile: fs.writeFileSync,
        readDirectory: fs.readdirSync,
        createDirectory: fs.mkdirSync,
        deleteDirectory: fs.rmdirSync,
        exists: fs.existsSync,
        getRealPath: fs.realpathSync,
        rename: fs.renameSync,
        renameSync: fs.renameSync,
        rm: fs.rmSync,
        rmSync: fs.rmSync,
        unlinkSync: fs.unlinkSync,
        createWriteStream: () => {},
        watch: fs.watch,
        getStats: fs.statSync
    },
    https: https,
    path: path
}
