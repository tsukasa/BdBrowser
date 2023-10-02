import fs from "node_shims/fs";
import {extname} from "node_shims/path";
import Logger from "common/logger";

const globalPaths = [];
const _extensions = {
    ".json": (module, filename) => {
        const filecontent = fs.readFileSync(filename);
        module.exports = JSON.parse(filecontent);
    },
    ".js": (module, filename) => {
        Logger.warn("Module", module, filename);
    }
};

function _require(path, req) {
    const extension = extname(path);
    const loader = _extensions[extension];

    if (!loader) {
        throw new Error(`Unknown file extension ${path}`);
    }

    const existsFile = fs.existsSync(path);

    if (!path) {
        Logger.warn("Module", path);
    }

    if (!existsFile) {
        throw new Error("Module not found!");
    }

    if (req.cache[path]) {
        return req.cache[path];
    }

    const final = {
        exports: {},
        filename: path,
        _compile: content => {
            // eslint-disable-next-line no-eval
            const {module} = eval(`((module, global) => {
                ${content}

                return {
                    module
                };
            })({exports: {}}, window)`);

            if (Object.keys(module.exports).length) {
                final.exports = module.exports;
            }

            return final.exports;
        }
    };
    loader(final, path);
    return req.cache[path] = final.exports;
}

export default {
    Module: {globalPaths, _extensions},
    _require
};
