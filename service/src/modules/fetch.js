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
        let fetchOptions = request.parameters.options || {};
        let fetchResponse = await fetch(request.parameters.url, fetchOptions);
        let fetchBody = await fetchResponse.text();

        returnValue = {
            body: fetchBody,
            headers: [],
            ok: fetchResponse.ok,
            redirected: fetchResponse.redirected,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            type: fetchResponse.type,
            url: fetchResponse.url
        };

        fetchResponse.headers.forEach((value, key) => {
            returnValue.headers.push([ key, value ]);
        });
    } catch (err) {
        returnValue = {
            error: err.toString()
        }
    }
    finally {
        return returnValue;
    }
}

export default {
    registerEvents
}
