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
import {fixWindowRequire} from "./modules/scriptPatches";

import "./modules/patches";

let bdPreloadHasInitialized = false;

const initialize = async () => {
    // Expose `require` early, so we have some tools
    // available in case of a failure...
    window.require = require;

    // Database connection
    const vfsDatabaseConnection = await fs.openDatabase();
    if (!vfsDatabaseConnection)
        throw new Error("BdBrowser Error: IndexedDB VFS database connection could not be established!");

    // VFS initialization
    const vfsInitialize = await fs.initializeVfs();
    if (!vfsInitialize)
        throw new Error("BdBrowser Error: IndexedDB VFS could not be initialized!");

    const loadBetterDiscord = async (scriptRequestResponse) => {
        const callback = async () => {
            DiscordModules.Dispatcher.unsubscribe("CONNECTION_OPEN", callback);
            Logger.log("Frontend", "Preparing to load BetterDiscord...");
            try {
                Logger.log("Frontend", "Patching script body...");
                let scriptBody = new TextDecoder().decode(scriptRequestResponse.body);
                scriptBody = fixWindowRequire(scriptBody);

                Logger.log("Frontend", "Loading BetterDiscord renderer...");
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
    };

    // Initialize BetterDiscord
    ipcRenderer.send(IPCEvents.GET_RESOURCE_URL, { url: "dist/betterdiscord.js" }, (localScriptUrl) => {
        window.Buffer = DiscordModules.Buffer;
        window.DiscordNative = DiscordNative;
        window.fetchWithoutCSP = fetchAPI;
        window.global = window;
        window.monaco = Monaco;
        window.process = process;

        window.BetterDiscordPreload = () => {
            if (bdPreloadHasInitialized) return null;
            bdPreloadHasInitialized = true;
            return bdPreload;
        };

        DOM.injectCSS("BetterDiscordWebStyles", `.CodeMirror {height: 100% !important;}`);
        ipcRenderer.send(IPCEvents.MAKE_REQUESTS, { url: localScriptUrl }, loadBetterDiscord);
    });
}

initialize().then(() => Logger.log("Frontend", "Initialization complete."));
