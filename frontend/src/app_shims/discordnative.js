import process from "app_shims/process";
import discord_voice from "native_shims/discord_voice";
import {AppHostVersion} from "common/constants";

export const app = {
    getReleaseChannel() {
        if (window.location.href.includes("canary")) return "canary";
        if (window.location.href.includes("ptb")) return "ptb";
        return "stable";
    },

    getVersion() {
        return AppHostVersion;
    },

    async getPath(path) {
        switch (path) {
            case "appData":
                return process.env.APPDATA;

            default:
                throw new Error("Cannot find path: " + path);
        }
    },

    relaunch() {
        window.location.reload();
    }
};

export const nativeModules = {
    requireModule(module) {
        switch (module) {
            case "discord_voice":
                return discord_voice;

            default:
                throw new Error("Cannot find module: " + module);
        }
    }
};

export default {
    app,
    nativeModules
};
