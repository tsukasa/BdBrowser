import Logger from "common/logger";
import {IPCEvents} from "common/constants";
import ipcRenderer from "./modules/ipc";
import BdAsarUpdater from "./modules/bdasarupdate";
import DiscordModules from "./modules/discordmodules";
import {default as Asar} from "./modules/asar";
import * as DiscordNative from "./modules/discordnative";
import {default as fetchAPI} from "./modules/fetch";
import bdPreload from "./modules/bdpreload";
import fs from "./modules/fs";
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

    const loadBetterDiscord = async (bdScriptBody) => {
        const callback = async () => {
            DiscordModules.Dispatcher.unsubscribe("CONNECTION_OPEN", callback);
            Logger.log("Frontend", "Preparing to load BetterDiscord...");
            try {
                let scriptBody = new TextDecoder().decode(bdScriptBody);

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

    if(!BdAsarUpdater.hasBetterDiscordAsarInVfs) {
        Logger.log("Frontend", "No BetterDiscord asar present in VFS, will try to download a copy...");
        const versionCheckData = await BdAsarUpdater.getCurrentBdVersionInfo();
        const updateWasSuccess = await BdAsarUpdater.downloadBetterDiscordAsar(versionCheckData.data, versionCheckData.remoteVersion);
        Logger.info("Frontend", `Asar update reports ${updateWasSuccess ? "success" : "failure"}.`);
    }

    // Support overriding the VFS betterdiscord.asar with a local copy from "dist/betterdiscord.js".
    // This should only be used for local development/debugging purposes!
    let bdBody;
    const localRendererUrl = await ipcRenderer.sendAwait(IPCEvents.GET_RESOURCE_URL, {url: "dist/betterdiscord.js"});
    const localRendererResp = await ipcRenderer.sendAwait(IPCEvents.MAKE_REQUESTS, {url: localRendererUrl});

    if(!localRendererResp) {
        Logger.info("Frontend", "Reading renderer.js from betterdiscord.asar...");
        const bdAsar = new Asar(BdAsarUpdater.asarFile.buffer);
        bdBody = bdAsar.get("renderer.js");
    } else {
        Logger.warn("Frontend", "Reading betterdiscord.js from extension web resources. This is for local development/debugging use only!");
        bdBody = localRendererResp.body;
    }

    if(!bdBody)
        Logger.error("Frontend", "No BetterDiscord renderer to execute.");
    else
        await loadBetterDiscord(bdBody);
}

initialize().then(() => Logger.log("Frontend", "Initialization complete."));
