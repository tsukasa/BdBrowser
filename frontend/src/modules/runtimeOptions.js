import ipcRenderer from "./ipc";
import {IPCEvents} from "common/constants";

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

    static getDisableBdRenderer() {
        return this.getOption("disableBdRenderer");
    }

    static setDisableBdRenderer(value) {
        this.setOption("disableBdRenderer", value);
    }

    static getDeleteBdRendererOnReload() {
        return this.getOption("deleteBdRendererOnReload");
    }

    static setDeleteBdRendererOnReload(value) {
        this.setOption("deleteBdRendererOnReload", value);
    }

    static async saveOptions() {
        ipcRenderer.send(IPCEvents.SET_EXTENSION_OPTIONS, extensionOptions);
    }
}
