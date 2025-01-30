import Logger from "common/logger";

function registerEvents() {
    Logger.log("Service", "Registering Message events.");
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.operation === "fetch") {
                processFetchMessage(request)
                    .then(result => sendResponse(result));
                return true;
            }
        }
    );
}

async function processFetchMessage(request) {
    let returnValue;
    try {
        const fetchOptions = request.parameters.options || {};
        const fetchResponse = await fetch(request.parameters.url, fetchOptions);
        const fetchBody = await fetchResponse.arrayBuffer();

        const defaultStatusMessages = {
            200: "OK",
            201: "Created",
            204: "No Content",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        };

        returnValue = {
            ok: fetchResponse.ok,
            redirected: fetchResponse.redirected,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText || defaultStatusMessages[fetchResponse.status],
            type: fetchResponse.type,
            body: Array.from(new Uint8Array(fetchBody)),
            headers: Object.fromEntries(fetchResponse.headers),
            url: fetchResponse.url
        };
    }
    catch (err) {
        returnValue = {
            error: err.toString()
        };
    }

    return returnValue;
}

export default {
    registerEvents
};
