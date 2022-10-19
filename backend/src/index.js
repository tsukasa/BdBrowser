import {IPCEvents} from "common/constants";
import DOM from "common/dom";
import IPC from "common/ipc";
import Logger from "common/logger";

function initialize() {
    registerEvents();

    Logger.log("Backend", "Initializing modules");
    const SCRIPT_URL = (() => {
        switch (ENV) {
            case "production":
                return chrome.runtime.getURL("dist/frontend.js");

            case "development":
                return "http://127.0.0.1:5500/frontend.js";

            default:
                throw new Error("Unknown Environment");
        }
    })();

    injectFrontend(SCRIPT_URL);
}

function injectFrontend(scriptUrl) {
    Logger.log("Backend", "Loading frontend script from:", scriptUrl);
    DOM.injectJS("BetterDiscordBrowser-frontend", scriptUrl, false);
}

function registerEvents() {
    Logger.log("Backend", "Registering events.");
    const ipcMain = new IPC("backend");

    ipcMain.on(IPCEvents.INJECT_CSS, (_, data) => {
        DOM.injectCSS(data.id, data.css);
    });

    ipcMain.on(IPCEvents.INJECT_THEME, (_, data) => {
        DOM.injectTheme(data.id, data.css);
    });

    ipcMain.on(IPCEvents.MAKE_REQUESTS, (event, data) => {
        // If the data is an object instead of a string, we probably
        // deal with a "request"-style request and have to re-order
        // the options.
        if(data.url && typeof(data.url) === "object") {
            // Deep clone data.url into the options and remove the url
            data.options = JSON.parse(JSON.stringify(data.url));
            data.options.url = undefined;

            if(data.url.url)
                data.url = data.url.url;
        }

        chrome.runtime.sendMessage(
            {
                operation: "fetch",
                parameters: {
                    url: data.url,
                    options: data.options
                }
            }, (response) => {
                if(response.error) {
                    console.error("BdBrowser Backend MAKE_REQUESTS failed:", data.url, response.error);
                }
                else
                {
                    // Response body comes in as a normal array, so requires
                    // another round of casting into Uint8Array for the buffer.
                    response.body = new Uint8Array(response.body).buffer;
                    ipcMain.reply(event, response);
                }
            }
        );
    });

    ipcMain.on(IPCEvents.GET_RESOURCE_URL, (event, data) => {
        ipcMain.reply(event, chrome.runtime.getURL(data.url));
    });
}

initialize();
