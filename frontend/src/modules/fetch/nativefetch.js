import fetch from "modules/fetch";
import Buffer from "node_shims/buffer";

function nativeFetch(url, options) {
    let state = "PENDING";
    let data = {content: [], headers: null, statusCode: null, url: url, statusText: "", redirected: false};
    let listenerCallback;
    let errorCallback;

    // NOTE: Since BetterDiscord's renderer/src/modules/api/fetch.js creates their own Response object,
    //       BdBrowser merely needs to ensure that the raw object values can be mapped properly.
    fetch(url,{headers: options.headers || {}, method: options.method || "GET", _wrapInResponse: false})
        .then(res => {
            data = res;
            data.content = Buffer.from(res.body);

            // Clean up unwanted properties
            delete data.body;

            state = "DONE";
            listenerCallback();
        })
        .catch(error => {
            state = "ABORTED";
            errorCallback(error);
        });

    return {
        onComplete(callback) {
            listenerCallback = callback;
        },
        onError(callback) {
            errorCallback = callback;
        },
        readData() {
            switch (state) {
                case "PENDING":
                    throw new Error("Cannot read data before request is done!");
                case "ABORTED":
                    throw new Error("Request was aborted.");
                case "DONE":
                    return data;
            }
        }
    };
}

export default nativeFetch;
