import {IPCEvents} from "common/constants";
import ipcRenderer from "../ipc";

const methods = ["get", "put", "post", "delete", "head"];
const aliases = {del: "delete"};

function parseArguments() {
    let url, options, callback;

    for (const arg of arguments) {
        switch (typeof arg) {
            case (arg !== null && "object"):
                options = arg;
                if ("url" in options) {
                    url = options.url;
                }
                break;

            case (!url && "string"):
                url = arg;
                break;

            case (!callback && "function"):
                callback = arg;
                break;
        }
    }

    return {url, options, callback};
}

function validOptions(url, callback) {
    return typeof url === "string" && typeof callback === "function";
}

export default function request() {
    const {url, options = {}, callback} = parseArguments.apply(this, arguments);

    if (!validOptions(url, callback))
        return null;

    ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {
        url: url, options: options
    }, data => {
        const res = new Response(data);
        res.statusCode = res.status;
        callback(null, res, data);
    });
}

Object.assign(request, Object.fromEntries(
    methods.concat(Object.keys(aliases)).map(method => [method, function () {
        const {url, options = {}, callback} = parseArguments.apply(this, arguments);

        if (!validOptions(url, callback))
            return null;

        options.method = method;

        request(url, options, callback);
    }])
));
