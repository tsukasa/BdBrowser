import {normalizePath} from "./fs";

export function join(...paths) {
    let final = "";
    for (let path of paths) {
        if (!path)
            continue;

        path = normalizePath(path);

        if (path[0] === "/")
            path = path.slice(1);

        final += path[path.length - 1] === "/" ? path : path + "/";
    }
    return final[final.length - 1] === "/" ? final.slice(0, final.length - 1) : final;
}

export function basename(filename) {
    if (typeof(filename) !== "string") {
        throw Object.assign(new TypeError(`The "filename" argument must be of type string. Received ${typeof (filename)}.`), {
            code: "ERR_INVALID_ARG_TYPE",
        });
    }

    return filename?.split("/")?.slice(-1)[0];
}

export function resolve(...paths) {
    return join(...paths);
}

export function extname(path) {
    let ext = path?.split(".")?.slice(-1)[0];
    if(ext) ext = ".".concat(ext);
    return ext;
}

export function dirname(path) {
    return path?.split("/")?.slice(0, -1)?.join("/");
}

export function isAbsolute(path) {
    path = normalizePath(path);
    return path?.startsWith("AppData/");
}

export default {
    basename,
    dirname,
    extname,
    isAbsolute,
    join,
    resolve
}
