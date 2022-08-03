import ipcRenderer from "./ipc";
import Logger from "common/logger";
import require from "./modules/require";
import * as DiscordNative from "./modules/discordnative";
import process from "./modules/process";
import fs from "./modules/fs";
import { IPCEvents } from "common/constants";
import { default as fetchAPI } from "./modules/fetch";
import * as monaco from "./modules/monaco";
import DOM from "common/dom";
import Webpack from "webpack";
import * as localStorage from "./modules/localStorage";

Object.defineProperty(Webpack.findByProps("requireModule"), "canBootstrapNewUpdater", {
    value: false,
    configurable: true
});

window.fallbackClassName = "bdfdb_is_garbage";
window.value = null;
window.firstArray = [];
window.user = "";

window.global = window;
window.DiscordNative = DiscordNative;
window.require = require;
window.process = process;
window.fs = fs;
window.fetchWithoutCSP = fetchAPI;
window.monaco = monaco;
window.IPC = ipcRenderer;

Logger.log("Frontend", `Loading, Environment = ${ENV}`);

import "./modules/patches";

DOM.injectCSS("BetterDiscordWebStyles", `.CodeMirror {height: 100% !important;}`);

// const getConfig = key => new Promise(resolve => chrome.storage.sync.get(key, resolve));

ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {
    url: ENV === "development" ? "http://127.0.0.1:5500/betterdiscord.js" : "https://static.tsukasa.io/BdBrowser/dist/betterdiscord.js"
}, async bd => {
    const Dispatcher = Webpack.findByProps("dispatch", "subscribe");

    Logger.log("Frontend", "Dispatcher found:", Dispatcher);

    const callback = async () => {
        Dispatcher.unsubscribe("CONNECTION_OPEN", callback);

        Logger.log("Frontend", "Loading BetterDiscord...");

        try {
            eval(`((fetch) => {${bd}})(window.fetchWithoutCSP)`);
        } catch (error) {
            Logger.error("Frontend", "Failed to load BetterDiscord:\n", error);
        }
    };

    const UserStore = Webpack.findByProps("getCurrentUser");
    if (!UserStore.getCurrentUser())
    {
        Logger.log("Frontend", "getCurrentUser failed.");
        /* Dispatcher.subscribe("CONNECTION_OPEN", callback); */
        setImmediate(callback);
    }
    else
    {
        Logger.log("Frontend", "getCurrentUser succeeded, running setImmediate().");
        setImmediate(callback);
    }
});
