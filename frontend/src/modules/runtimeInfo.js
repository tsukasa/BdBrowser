import {IPCEvents} from "common/constants";
import BdAsarUpdater from "./bdAsarUpdater";
import ipcRenderer from "./ipc";

const UNKNOWN_VERSION = "UNKNOWN";

let runtimeInfo;
let activeVersionObserver;

(async () => {
    const manifestInfo = await ipcRenderer.sendAwait(IPCEvents.GET_MANIFEST_INFO);
    const bdVersion = BdAsarUpdater.getVfsBetterDiscordAsarVersion();

    runtimeInfo = {
        manifest: manifestInfo,
        bdVersion: bdVersion,
        rendererSourceName: "Unknown",
        isVfsFile: false
    };
})();

/***
 * Adds a MutationObserver to inject BdBrowser version information
 * into the user settings.
 */
export function addExtensionVersionInfo() {
    const idSpanVersion = "bdbrowser-ver-info";
    const idSpanRenderer = "bdbrowser-rndr-info";
    const versionSelector = `div[class*="side-"] div[class*="info-"] span[class*="line-"] span[class*="versionHash-"]`;

    const addVersionInfoObserver = new MutationObserver(mutations => {
        if(document.querySelector(`#${idSpanVersion}`))
            return;

        const discordBuildInfo = document.querySelector(versionSelector)?.parentNode;
        if (!discordBuildInfo)
            return;

        const addInfoSpanElement = (spanId, text = "", additionalStyles = [""]) => {
            let el = document.createElement("span");
            el.id = spanId;
            el.textContent = text;
            el.setAttribute("class", discordBuildInfo.getAttribute("class"));
            el.setAttribute("data-text-variant", discordBuildInfo.getAttribute("data-text-variant"));
            el.setAttribute("style", discordBuildInfo.getAttribute("style")
                    .concat(";", "text-transform: none !important;", additionalStyles.join(";")));
            return el;
        };

        const bdbVersionInfo = addInfoSpanElement(
            idSpanVersion,
            `${runtimeInfo.manifest.name} ${runtimeInfo.manifest.version}`
        );
        discordBuildInfo.after(bdbVersionInfo);

        const bdbRendererInfo = addInfoSpanElement(
            idSpanRenderer,
            getFormattedBdRendererSourceString(),
            [(runtimeInfo.isVfsFile ? "" : "color: var(--text-warning);")]
        );
        bdbVersionInfo.after(bdbRendererInfo);
    });

    if (!activeVersionObserver) {
        addVersionInfoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        activeVersionObserver = addVersionInfoObserver;
    }
}

/**
 * Returns a pre-defined string indicating the source of the BetterDiscord renderer.
 * @returns {string} - A formatted string showing BetterDiscord renderer source and version.
 */
export function getFormattedBdRendererSourceString() {
    const version = (runtimeInfo.bdVersion === UNKNOWN_VERSION) ? UNKNOWN_VERSION : "v" + runtimeInfo.bdVersion;
    const hostFs = runtimeInfo.isVfsFile ? "VFS" : "local";

    return `${runtimeInfo.rendererSourceName} (${version}, ${hostFs})`;
}

/**
 * Returns an object containing the manifest and runtime information.
 * @returns {object} - An object containing runtime information.
 */
export function getRuntimeInfo() {
    return runtimeInfo;
}

/**
 * Reads the version number of the BetterDiscord renderer
 * from the script body and makes it available via
 * `getRuntimeInfo()`.
 * @param {string} bdBodyScript - The script body to parse
 */
export function parseBetterDiscordVersion(bdBodyScript) {
    const versionNumberRegex = /version:"(.*?)"/;
    const versionMatches = bdBodyScript.match(versionNumberRegex);
    let versionString = UNKNOWN_VERSION;

    if(versionMatches)
        versionString = versionMatches.at(-1);

    runtimeInfo.bdVersion = versionString;

    // If we are dealing with an asar file, we should also update the
    // version file in the VFS, so people can easily filter their
    // backups.
    if (runtimeInfo.rendererSourceName === "betterdiscord.asar" && runtimeInfo.isVfsFile)
        BdAsarUpdater.setVfsBetterDiscordAsarVersion(versionString);
}

/**
 * Sets whether the BetterDiscord renderer has been loaded from an asar file within the VFS.
 * @param {String} sourceName
 * @param {Boolean} isVfsFile
 */
export function setBdRendererSource(sourceName, isVfsFile) {
    runtimeInfo.rendererSourceName = sourceName;
    runtimeInfo.isVfsFile = isVfsFile;
}

export default {
    addExtensionVersionInfo,
    getFormattedBdRendererSourceString,
    getRuntimeInfo,
    parseBetterDiscordVersion,
    setBdRendererSource
}
