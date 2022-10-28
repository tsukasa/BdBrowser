import Logger from "common/logger";
import {IPCEvents} from "common/constants";
import ipcRenderer from "./ipc";
import DiscordModules from "./modules/discordmodules";
import * as DiscordNative from "./modules/discordnative";
import {default as fetchAPI} from "./modules/fetch";
import fs from "./modules/fs";
import bdPreload from "./modules/bdpreload";
import process from "./modules/process";
import require from "./modules/require";

import "./modules/patches";

let allowRequireOverride = false;
let bdPreloadHasInitialized = false;

const initialize = async () => {
    // Expose `window.require` early, so we have some tools
    // available in case of a failure...
    let requireFunc = require.bind({});
    window.require = requireFunc;

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
                let scriptBody = new TextDecoder().decode(scriptRequestResponse.body);

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
        window.process = process;

        window.BetterDiscordPreload = () => {
            if (bdPreloadHasInitialized) return null;
            bdPreloadHasInitialized = true;
            return bdPreload;
        };

        // Prevent warnings for non-existing properties during Webpack search in "nativeModules".
        Object.defineProperty(DiscordModules.ElectronModule, "canBootstrapNewUpdater", {
            value: false,
            configurable: true
        });

        // Prevent the _very first_ override of window.require by BetterDiscord
        // to keep BdBrowser's own version intact.
        // However, allow later changes to it (i.e. for Monaco).
        Object.defineProperty(window, "require", {
            get() {
                return requireFunc;
            },
            set(newValue) {
                if (!allowRequireOverride) return (allowRequireOverride = true);
                requireFunc = newValue;
            }
        });

        ipcRenderer.send(IPCEvents.MAKE_REQUESTS, { url: localScriptUrl }, loadBetterDiscord);
    });
}

initialize().then(() => Logger.log("Frontend", "Initialization complete."));
