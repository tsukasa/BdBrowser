import Logger from "common/logger";
import fs from "./fs";
import request from "./request";
import {FilePaths} from "common/constants";

const USER_AGENT = "BdBrowser Updater";
const LOGGER_SECTION = "AsarUpdater";

export default class BdAsarUpdater {
    /**
     * Gets the version of BetterDiscord's asar according to the version file in the VFS.
     * @returns {string} - Version number or `0.0.0` if no value is set yet.
     */
    static getVfsBetterDiscordAsarVersion() {
        if(fs.existsSync(FilePaths.BD_ASAR_VERSION_PATH))
            return fs.readFileSync(FilePaths.BD_ASAR_VERSION_PATH).toString();
        else
            return "0.0.0";
    }

    /**
     * Sets the version of BetterDiscord's asar in the version file within the VFS.
     * @param {string} versionString
     */
    static setVfsBetterDiscordAsarVersion(versionString) {
        fs.writeFileSync(FilePaths.BD_ASAR_VERSION_PATH, versionString);
    }

    /**
     * Returns whether a BetterDiscord asar exists in the VFS.
     * @returns {boolean}
     */
    static get hasBetterDiscordAsarInVfs() {
        return fs.existsSync(FilePaths.BD_ASAR_PATH);
    }

    /**
     * Returns a Buffer containing the contents of the asar file.
     * If the file is not present in the VFS, a ENOENT exception is thrown.
     * @returns {*|Buffer}
     */
    static get asarFile() {
        if(this.hasBetterDiscordAsarInVfs)
            return fs.readFileSync(FilePaths.BD_ASAR_PATH);
        else
            return fs.statSync(FilePaths.BD_ASAR_PATH);
    }

    /**
     * Checks BetterDiscord's GitHub releases for the latest version and returns
     * the update information to the caller.
     * @returns {Promise<{hasUpdate: boolean, data: any, remoteVersion: *}>}
     */
    static async getCurrentBdVersionInfo() {
        Logger.log(LOGGER_SECTION, "Checking for latest BetterDiscord version...");

        const resp = await fetch("https://api.github.com/repos/BetterDiscord/BetterDiscord/releases/latest", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT
            }
        });

        const data = await resp.json();
        const remoteVersion = data["tag_name"].startsWith("v") ? data["tag_name"].slice(1) : data["tag_name"];
        const hasUpdate = remoteVersion > this.getVfsBetterDiscordAsarVersion();

        Logger.log(LOGGER_SECTION, `Latest stable BetterDiscord version is ${remoteVersion}.`);

        return {
            data,
            remoteVersion,
            hasUpdate
        };
    }

    /**
     * Downloads the betterdiscord.asar specified in updateInfo and saves the file into the VFS.
     * @param updateInfo
     * @param remoteVersion
     * @returns {Promise<boolean>}
     */
    static async downloadBetterDiscordAsar(updateInfo, remoteVersion) {
        try {
            const asar = updateInfo.assets.find(a => a.name === "betterdiscord.asar");

            Logger.log(LOGGER_SECTION, `Downloading BetterDiscord v${remoteVersion} into VFS...`);
            const startTime = performance.now();

            const buff = await new Promise((resolve, reject) =>
                request(asar.url, {
                    headers: {
                        "Accept": "application/octet-stream",
                        "Content-Type": "application/octet-stream",
                        "User-Agent": USER_AGENT
                    }}, (err, resp, body) => {
                    if (err || resp.statusCode !== 200)
                        return reject(err || `${resp.statusCode} ${resp.statusMessage}`);
                    return resolve(body);
                })
            );

            Logger.info(LOGGER_SECTION, "Download complete, saving into VFS...");
            fs.writeFileSync(FilePaths.BD_ASAR_PATH, buff);

            Logger.info(LOGGER_SECTION, `Persisting version information in: ${FilePaths.BD_ASAR_VERSION_PATH}`);
            this.setVfsBetterDiscordAsarVersion(remoteVersion);

            const endTime = performance.now();
            Logger.info(LOGGER_SECTION, `betterdiscord.asar installed, took ${(endTime - startTime).toFixed(2)}ms.`);
            return true;
        } catch (err) {
            Logger.error(LOGGER_SECTION, "Failed to download BetterDiscord", err);
            return false;
        }
    }
}
