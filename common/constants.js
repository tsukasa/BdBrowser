export const IPCEvents = {
    GET_MANIFEST_INFO: "bdbrowser-get-extension-manifest",
    GET_RESOURCE_URL: "bdbrowser-get-extension-resourceurl",
    GET_EXTENSION_OPTIONS: "bdbrowser-get-extension-options",
    SET_EXTENSION_OPTIONS: "bdbrowser-set-extension-options",
    INJECT_CSS: "bdbrowser-inject-css",
    INJECT_THEME: "bdbrowser-inject-theme",
    MAKE_REQUESTS: "bdbrowser-make-requests"
};

export const FilePaths = {
    BD_ASAR_PATH: "AppData/BetterDiscord/data/betterdiscord.asar",
    BD_ASAR_VERSION_PATH: "AppData/BetterDiscord/data/bd-asar-version.txt",
    BD_CONFIG_PLUGINS_PATH: "AppData/BetterDiscord/data/&1/plugins.json",
    LOCAL_BD_ASAR_PATH: "bd/betterdiscord.asar",
    LOCAL_BD_RENDERER_PATH: "bd/renderer.js"
};

export const AppHostVersion = "1.0.9007";

export default {
    IPCEvents,
    FilePaths,
    AppHostVersion
};
