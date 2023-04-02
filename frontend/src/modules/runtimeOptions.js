import Logger from "common/logger";
import {FilePaths} from "common/constants";
import {IPCEvents} from "common/constants";
import {app} from "./discordnative";
import fs from "./fs";
import ipcRenderer from "./ipc";

const LOGGER_SECTION = "RuntimeOptions";

let extensionOptions = {};

export default class RuntimeOptions {
    static async initializeOptions() {
        extensionOptions = await ipcRenderer.sendAwait(IPCEvents.GET_EXTENSION_OPTIONS);
    }

    static getOption(optionName) {
        return extensionOptions[optionName];
    }

    static setOption(optionName, optionValue) {
        extensionOptions[optionName] = optionValue;
    }

    static async saveOptions() {
        ipcRenderer.send(IPCEvents.SET_EXTENSION_OPTIONS, extensionOptions);
    }

    static get shouldStartBetterDiscordRenderer() {
        return this.getOption("disableBdRenderer") !== true;
    }

    /**
     * Checks if the BetterDiscord asar file exists in the VFS and deletes it if it does.
     * Setting is controlled by the "deleteBdRendererOnReload" option.
     * @returns {Promise<void>}
     */
    static async checkAndPerformBetterDiscordAsarRemoval() {
        if(this.getOption("deleteBdRendererOnReload") && fs.existsSync(FilePaths.BD_ASAR_PATH)) {
            fs.unlinkSync(FilePaths.BD_ASAR_PATH);
            Logger.log(LOGGER_SECTION, "Forced BetterDiscord asar file removal from VFS complete.");
        }

        this.setOption("deleteBdRendererOnReload", false);
        await this.saveOptions();
    }

    /**
     * Disables all BetterDiscord plugins by setting their value to false in the plugins.json file.
     * @returns {Promise<void>}
     */
    static async disableAllBetterDiscordPlugins() {
        if (!this.getOption("disableBdPluginsOnReload"))
            return;

        const pluginConfigPath = FilePaths.BD_CONFIG_PLUGINS.replace("&1", app.getReleaseChannel());

        if (!fs.existsSync(pluginConfigPath))
            return;

        const rawFileData = fs.readFileSync(pluginConfigPath);
        let plugins = JSON.parse(new TextDecoder().decode(rawFileData));

        for (let plugin in plugins) {
            plugins[plugin] = false;
        }

        fs.writeFileSync(pluginConfigPath, JSON.stringify(plugins, null, 4));

        this.setOption("disableBdPluginsOnReload", false);
        await this.saveOptions();
    }
}
