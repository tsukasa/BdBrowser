import Buffer from "./buffer";
import Events from "./events";
import fetch from "./fetch";

export function request(url, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    if(typeof url === "object") {
        options = JSON.parse(JSON.stringify(url));
        options.url = undefined;
        url = url.url;
    }

    // TODO: Refactor `fetch()` into a more generic function
    //       that does not require these hacks...
    options._wrapInResponse = false;

    const emitter = new Events();

    callback(emitter);

    fetch(url, options)
        .then(data => {
            emitter.emit("data", Buffer.from(data.body));

            const res = new Response();
            Object.defineProperty(res, "headers", { value: data.headers });
            Object.defineProperty(res, "ok", { value: data.ok });
            Object.defineProperty(res, "redirected", { value: data.redirected });
            Object.defineProperty(res, "status", { value: data.status });
            Object.defineProperty(res, "statusCode", { value: data.status });
            Object.defineProperty(res, "statusText", { value: data.statusText });
            Object.defineProperty(res, "type", { value: data.type });
            Object.defineProperty(res, "url", { value: "" });
            emitter.emit("end", res);
        })
        .catch(error => {
            emitter.emit("error", error);
        });

    return emitter;
}

export function createServer() {
    return {
        listen: () => {
        },
        close: () => {
        }
    };
}

export function get() {
    request.apply(this, arguments);
}

const https = request;
https.get = request;
https.createServer = createServer;
https.request = request;

export default https;