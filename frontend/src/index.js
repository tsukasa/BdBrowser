import fs from "node_shims/fs";
import startup from "modules/startup";
import RuntimeOptions from "modules/runtimeoptions";

import "patches";

(async () => {
    startup.prepareWindow();

    await RuntimeOptions.initializeOptions();

    if (!await fs.openDatabase()) {
        throw new Error("BdBrowser Error: IndexedDB VFS database connection could not be established!");
    }

    if (!await fs.initializeVfs()) {
        throw new Error("BdBrowser Error: IndexedDB VFS could not be initialized!");
    }

    if (!await startup.checkAndDownloadBetterDiscordAsar()) {
        throw new Error("BdBrowser Error: Downloading betterdiscord.asar or writing into VFS failed!");
    }

    if (!await startup.loadBetterDiscord()) {
        throw new Error("BdBrowser Error: Cannot load BetterDiscord renderer for injection!");
    }
})();
