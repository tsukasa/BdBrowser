import DiscordModules from "discordmodules";

// https://developer.mozilla.org/en/docs/Web/API/Page_Visibility_API
const [hidden, visibilityChange] = (() => {
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        return ["hidden", "visibilitychange"];
    } else if (typeof document.msHidden !== "undefined") {
        return ["msHidden", "msvisibilitychange"];
    } else if (typeof document.webkitHidden !== "undefined") {
        return ["webkitHidden", "webkitvisibilitychange"];
    }
})();

export default class IPCRenderer {
    static listeners = {};

    static addWindowListeners() {
        document.addEventListener(visibilityChange, () => {
            if (document[hidden]) {
                this.fire("bd-window-maximize");
            } else {
                this.fire("bd-window-minimize");
            }
        });
    }

    static createEvent(event) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
    }

    static fire(event, ...args) {
        if (this.listeners[event]) {
            for (const listener of this.listeners[event]) {
                listener(...args);
            }
        }
    }

    static initialize() {
        this.addWindowListeners();
    }

    static async invoke(event) {
        console.log("INVOKE:", event);
        switch (event) {
            case "bd-config":
                return {
                    version: "0.6.0",
                    local: false,
                    localPath: "",
                    branch: "development",
                    bdVersion: "1.0.0",
                    minSupportedVersion: "0.3.0",
                    hash: "gh-pages",
                    dataPath: "AppData/BetterDiscord/"
                };

            case "bd-injector-info":
                return {
                    version: "1.0.0"
                };

            default:
                null;
        }
    }

    static on(event, callback) {
        switch (event) {
            case "bd-did-navigate-in-page":
                return this.onSwitch(callback);

            default:
                this.createEvent(event);
                this.listeners[event].add(callback);
        }
    }

    static onSwitch(callback) {
        DiscordModules.RouterModule.listeners.add(callback);
    }

    static send(event, ...args) {
        switch (event) {
            case "bd-relaunch-app":
                document.location.reload();
                break;

            default:
                console.log("IPCRenderer SEND:", event, args);
        }
    }
}
