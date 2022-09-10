import * as electron from "./electron";
import * as RequestModule from "./request";
import * as path from "./path";
import fs from "./fs";

const bdPreloadCatalogue = {
    electron: electron,
    filesystem: {
        readFile: fs.readFileSync,
        writeFile: fs.writeFileSync,
        readDirectory: fs.readdirSync,
        createDirectory: fs.mkdirSync,
        deleteDirectory: fs.rmdirSync,
        exists: fs.existsSync,
        getRealPath: fs.realpathSync,
        rename: () => {},
        watch: fs.watch,
        getStats: fs.statSync
    },
    https: RequestModule, // Not https, despite what you might think!
    path: path
}

export default bdPreloadCatalogue;