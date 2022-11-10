import process from "./process";

const APP_HOST_VERSION = "1.0.9007";

export const app = {
    getReleaseChannel() {
        if (location.href.includes("canary"))
            return "canary";

        if (location.href.includes("ptb"))
            return "ptb";

        return "stable";
    },

    getVersion() {
        return APP_HOST_VERSION;
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
        location.reload();
    }
}

export default {
    app
}
