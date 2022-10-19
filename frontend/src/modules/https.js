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

    fetch(url, options)
        .then(data => {
            callback({
                on: (event, callback) => {
                    switch (event) {
                        case "data":
                            return callback(data.body);
                        case "end":
                            const res = new Response(data.body);
                            Object.defineProperty(res, "headers", { value: data.headers });
                            Object.defineProperty(res, "ok", { value: data.ok });
                            Object.defineProperty(res, "redirected", { value: data.redirected });
                            Object.defineProperty(res, "status", { value: data.status });
                            Object.defineProperty(res, "statusCode", { value: data.status });
                            Object.defineProperty(res, "statusText", { value: data.statusText });
                            Object.defineProperty(res, "type", { value: data.type });
                            Object.defineProperty(res, "url", { value: data.url });
                            return res;
                    }
                }
            });
        });

    return {
        statusCode: 200,
        on: () => {
        },
        end: () => {
        }
    }
}

export function createServer() {
    return {
        listen: () => {
        },
        close: () => {
        }
    };
}

export const get = request;

export default { get };