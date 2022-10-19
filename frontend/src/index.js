import DOM from "common/dom";
import Logger from "common/logger";
import {IPCEvents} from "common/constants";
import ipcRenderer from "./ipc";
import DiscordModules from "./modules/discordmodules";
import * as DiscordNative from "./modules/discordnative";
import {default as fetchAPI} from "./modules/fetch";
import fs from "./modules/fs";
import * as Monaco from "./modules/monaco";
import bdPreload from "./modules/bdpreload";
import process from "./modules/process";
import require from "./modules/require";
import {fixUpdaterPathRequire, fixWindowRequire} from "./modules/scriptPatches";

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

window.Buffer = DiscordModules.Buffer;
window.DiscordNative = DiscordNative;
window.fetchWithoutCSP = fetchAPI;
window.fs = fs;
window.IPC = ipcRenderer;
window.monaco = Monaco;
window.process = process;
window.require = require;

// Electron 17 requirements adapted from the preloader.
let hasInitialized = false;
window.BetterDiscordPreload = () => {
    if(hasInitialized) return null;
    hasInitialized = true;
    return bdPreload;
};

let bdScriptUrl;

import "./modules/patches";

// const getConfig = key => new Promise(resolve => chrome.storage.sync.get(key, resolve));

async function initialize() {
    // Database connection
    const vfsDatabaseConnection = await fs.openDatabase();
    if(!vfsDatabaseConnection)
        throw new Error("BdBrowser Error: IndexedDB VFS database connection could not be established!");

    // VFS initialization
    const vfsInitialize = await fs.initializeVfs();
    if(!vfsInitialize)
        throw new Error("BdBrowser Error: IndexedDB VFS could not be initialized!");

    // Initialize BetterDiscord
    Logger.log("Frontend", `Loading, Environment = ${ENV}`);
    DOM.injectCSS("BetterDiscordWebStyles", `.CodeMirror {height: 100% !important;}`);
    ipcRenderer.send(IPCEvents.GET_RESOURCE_URL, {url: "dist/betterdiscord.js"}, selectBetterDiscordEnvironment);
}

async function selectBetterDiscordEnvironment(localScriptUrl) {
    bdScriptUrl = (ENV === "development") ? "http://127.0.0.1:5500/betterdiscord.js" : localScriptUrl;
    ipcRenderer.send(IPCEvents.MAKE_REQUESTS, { url: bdScriptUrl }, loadBetterDiscord);
}

async function loadBetterDiscord(scriptResponse) {
    const callback = async () => {
        DiscordModules.Dispatcher.unsubscribe("CONNECTION_OPEN", callback);
        Logger.log("Frontend", `Loading BetterDiscord from ${bdScriptUrl}...`);
        try {
            Logger.log("Frontend", "Patching script body...");

            let scriptBody = new TextDecoder().decode(scriptResponse.body);
            scriptBody = fixUpdaterPathRequire(scriptBody);
            scriptBody = fixWindowRequire(scriptBody);

            eval(`(() => { ${scriptBody} })(window.fetchWithoutCSP)`);
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
}

initialize();