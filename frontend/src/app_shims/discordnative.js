import process from "app_shims/process";
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

export default {
    app
};
