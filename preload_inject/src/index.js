/**
 * This script is being used as a content script by the Chrome extension.
 * Contrary to `backend.js` it runs at `document_start` so it is able to
 * inject the contents of `preload.js` early into the document.
 */
import Logger from "common/logger"

function initialize() {
    injectPreload();
}

/**
 * Injects the `preload.js` into the document, so it can execute early.
 * This roundabout way is required due to restrictions on how content scripts
 * can interact with the top document.
 */
function injectPreload() {
    Logger.log("Injector", "Injecting preload.js into document to prepare environment...");

    const scriptElement = document.createElement("script");
    scriptElement.src = chrome.runtime.getURL("dist/preload.js");

    (document.head || document.documentElement).appendChild(scriptElement);
}

initialize();
