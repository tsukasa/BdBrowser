import process from "./process";

const VERSION = "1.0.9007";

export const app = {
    getReleaseChannel() {
        if (location.href.includes("canary"))
            return "canary";

        if (location.href.includes("ptb"))
            return "ptb";

        return "stable";
    },

    getVersion() {
        return VERSION;
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
