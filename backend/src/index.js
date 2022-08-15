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
    Logger.log("Backend", "Registering events");
    const ipcMain = new IPC("backend");

    ipcMain.on(IPCEvents.INJECT_CSS, (_, data) => {
        DOM.injectCSS(data.id, data.css);
    });

    ipcMain.on(IPCEvents.INJECT_THEME, (_, data) => {
        DOM.injectTheme(data.id, data.css);
    });

    ipcMain.on(IPCEvents.MAKE_REQUESTS, (event, data) => {
        fetch(data.url)
            .catch(console.error.bind(null, "REQUEST FAILED:"))
            .then(res => res.text()).then(text => {
            ipcMain.reply(event, text);
        })
    });

    ipcMain.on(IPCEvents.GET_RESOURCE_URL, (event, data) => {
        ipcMain.reply(event, chrome.runtime.getURL(data.url));
    });
}

initialize();
