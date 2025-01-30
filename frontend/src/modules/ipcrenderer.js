import DiscordModules from "modules/discordmodules";
import Logger from "common/logger";
import DOM from "common/dom";
import fs from "node_shims/fs";
import {IPCEvents} from "common/constants";

// https://developer.mozilla.org/en/docs/Web/API/Page_Visibility_API
const [hidden, visibilityChange] = (() => {
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        return ["hidden", "visibilitychange"];
    }
    else if (typeof document.msHidden !== "undefined") {
        return ["msHidden", "msvisibilitychange"];
    }
    else if (typeof document.webkitHidden !== "undefined") {
        return ["webkitHidden", "webkitvisibilitychange"];
    }
})();

export default class IPCRenderer {
    static listeners = {};

    static addWindowListeners() {
        document.addEventListener(visibilityChange, () => {
            if (document[hidden]) {
                this.fire("bd-window-maximize");
            }
            else {
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
        switch (event) {
            case "bd-get-accent-color":
                // Right now it appears there is no proper cross-platform way to get the system accent color.
                // According https://stackoverflow.com/a/71539151 this seems to be the best compromise.
                return "Highlight";

            default:
                Logger.log("IPCRenderer", "INVOKE:", event);
        }
    }

    static on(event, callback) {
        switch (event) {
            case "bd-did-navigate-in-page":
                return this.onSwitch(callback);

            case IPCEvents.HANDLE_PROTOCOL:
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
            case "bd-open-path":
                // In case there is more than one argument, we cannot deal with this.
                if (args.length !== 1) {
                    Logger.log("IPCRenderer", "IPCRenderer bd-open-path called:", args);
                    break;
                }
                // If this becomes a more prominent issue, a proper implementation might be required...
                const pathElement = args[0].split("/").pop();
                let acceptedFileTypes = "*.*";
                if (pathElement !== "themes" && pathElement !== "plugins") {
                    Logger.log("IPCRenderer", "IPCRenderer bd-open-path called with unsupported path type:", args);
                    break;
                }
                switch (pathElement.toLowerCase()) {
                    case "themes":
                        acceptedFileTypes = ".theme.css";
                        break;
                    case "plugins":
                        acceptedFileTypes = ".plugin.js";
                        break;
                }
                const inputEl = DOM.createElement("input", {type: "file", multiple: "multiple", accept: acceptedFileTypes});
                inputEl.addEventListener("change", () => {
                    for (const file of inputEl.files) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            fs.writeFileSync(`AppData/BetterDiscord/${pathElement}/${file.name}`, new Uint8Array(reader.result));
                        };
                        reader.readAsArrayBuffer(file);
                    }
                });
                inputEl.click();
                break;
            default:
                Logger.log("IPCRenderer", "IPCRenderer SEND:", event, args);
        }
    }
}
