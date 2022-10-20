import {IPCEvents} from "common/constants";
import ipcRenderer from "../ipc";
import MimeTypes from "./mime-types";

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
        let bodyData;

        // Try to evaluate whether the result is text or binary...
        if(data.headers["content-type"]) {
            const enc = MimeTypes.charset(data.headers["content-type"]);

            // If the "encoding" parameter is present in the original options and it is
            // set to null, the return value should be an ArrayBuffer. Otherwise check
            // the Mime database for the type to determine whether it is text or not...
            if("encoding" in options && options.encoding === null)
                bodyData = data.body;
            else
                bodyData = new TextDecoder(enc).decode(data.body);
        }

        const res = {
            headers: data.headers,
            aborted: !data.ok,
            complete: true,
            end: undefined,
            statusCode: data.status,
            statusMessage: data.statusText,
            url: ""
        }

        callback(null, res, bodyData);
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
