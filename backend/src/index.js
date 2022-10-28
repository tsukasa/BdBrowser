import DOM from "common/dom";
import IPC from "common/ipc";
import Logger from "common/logger";
import {IPCEvents} from "common/constants";
import LoadingScreen from "./modules/loadingScreen";

/**
 * Initializes the "backend" side of BdBrowser.
 * Some parts need to fire early (document_start) in order to patch
 * objects in Discord's DOM while other parts are to be fired later
 * (document_idle) after the page has loaded.
 */
function initialize() {
    const doOnDocumentComplete = () => {
        registerEvents();

        Logger.log("Backend", "Initializing modules.");
        injectFrontend(chrome.runtime.getURL("dist/frontend.js"));
    }

    const documentCompleteCallback = () => {
        if (document.readyState !== "complete")
            return;

        document.removeEventListener("readystatechange", documentCompleteCallback);
        doOnDocumentComplete();
    }

    // Preload should fire as early as possible and is the reason for
    // running the backend during `document_start`.
    injectPreload();

    if (document.readyState === "complete")
        doOnDocumentComplete()
    else
        document.addEventListener("readystatechange", documentCompleteCallback);

    LoadingScreen.ReplaceLoadingAnimation();
}

/**
 * Injects the Frontend script into the page.
 * Should fire when the page is complete (document_idle).
 * @param {string} scriptUrl - Internal URL to the script
 */
function injectFrontend(scriptUrl) {
    Logger.log("Backend", "Loading frontend script from:", scriptUrl);
    DOM.injectJS("BetterDiscordBrowser-frontend", scriptUrl, false);
}

/**
 * Injects the Preload script into the page.
 * Should fire as soon as possible (document_start).
 */
function injectPreload() {
    Logger.log("Backend", "Injecting preload.js into document to prepare environment...");

    const scriptElement = document.createElement("script");
    scriptElement.src = chrome.runtime.getURL("dist/preload.js");

    (document.head || document.documentElement).appendChild(scriptElement);
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
                if (response.error) {
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
