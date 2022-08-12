import DOM from "common/dom";
import Logger from "common/logger";
import {IPCEvents} from "common/constants";
import ipcRenderer from "./ipc";
import DiscordModules from "./modules/discordmodules";
import * as DiscordNative from "./modules/discordnative";
import {default as fetchAPI} from "./modules/fetch";
import Filesystem from "./modules/fs";
import * as Monaco from "./modules/monaco";
import process from "./modules/process";
import require from "./modules/require";

Object.defineProperty(
    DiscordModules.ElectronModule,
    "canBootstrapNewUpdater",
    {
        value: false,
        configurable: true
    }
);

window.fallbackClassName = "bdfdb_fallbackClass";
window.value = null;
window.firstArray = [];
window.user = "";
window.global = window;

window.fetchWithoutCSP = fetchAPI;
window.fs = Filesystem;
window.DiscordNative = DiscordNative;
window.IPC = ipcRenderer;
window.monaco = Monaco;
window.process = process;
window.require = require;

Logger.log("Frontend", `Loading, Environment = ${ENV}`);

import "./modules/patches";

DOM.injectCSS("BetterDiscordWebStyles", `.CodeMirror {height: 100% !important;}`);

// const getConfig = key => new Promise(resolve => chrome.storage.sync.get(key, resolve));

ipcRenderer.send(IPCEvents.GET_RESOURCE_URL, {url: "dist/betterdiscord.js"}, async resource_url => {
    ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {
        url: ENV === "development" ? "http://127.0.0.1:5500/betterdiscord.js" : resource_url
    }, async bd => {
        const callback = async () => {
            DiscordModules.Dispatcher.unsubscribe("CONNECTION_OPEN", callback);

            Logger.log("Frontend", `Loading BetterDiscord from ${resource_url}...`);

            try {
                eval(`((fetch) => {
                    ${bd}
                })(window.fetchWithoutCSP)`);
            } catch (error) {
                Logger.error("Frontend", "Failed to load BetterDiscord:\n", error);
            }
        };

        if (!DiscordModules.UserStore?.getCurrentUser()) {
            Logger.log("Frontend", "getCurrentUser failed, registering callback.");
            DiscordModules.Dispatcher.subscribe("CONNECTION_OPEN", callback);
        } else {
            Logger.log("Frontend", "getCurrentUser succeeded, running setImmediate().");
            setImmediate(callback);
        }
    });
});
