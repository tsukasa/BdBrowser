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

    fetch(url, options)
        .then(res => res.text())
        .then(data => {
            callback({
                on: (event, callback) => {
                    switch (event) {
                        case "data":
                            return callback(data);
                        case "end":
                            const res = new Response(data);
                            res.statusCode = res.status;
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