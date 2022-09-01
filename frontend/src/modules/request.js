import {IPCEvents} from "common/constants";
import ipcRenderer from "../ipc";

class RequestResponse extends Response {
    constructor(res) {
        super(res);
        this.res = res;
    }

    get headers() {
        return Object.fromEntries(Array.from(this.res.headers));
    }
};

export default function request(url, options, callback) {
    if (typeof options === "function") {
        callback = options
        options = {};
    }

    if(typeof url === "object") {
        options = JSON.parse(JSON.stringify(url));
        options.url = undefined;
        url = url.url;
    }

    ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {
        url: url, options: options
    }, data => {
        const res = new Response(data);
        res.statusCode = res.status;
        callback(null, res, data);
    });
}

export function head(url, options, callback) {
    if (typeof options === "function") {
        callback = options
        options = {};
    }

    fetch(url).then(res => {
        callback(null, new RequestResponse(res));
    }, err => callback(err));
}

Object.assign(
    request,
    {
        get: request,
        head: head
    }
);
