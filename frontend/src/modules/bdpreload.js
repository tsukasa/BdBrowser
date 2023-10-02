import electron from "app_shims/electron";
import fs from "node_shims/fs";
import https from "node_shims/https";
import path from "node_shims/path";
import {default as nativeFetch} from "modules/fetch/nativefetch";

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
    nativeFetch: nativeFetch,
    https: https,
    path: path
};
