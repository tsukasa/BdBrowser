import DOM from "common/dom";
import fs from "node_shims/fs";
import ipcRenderer from "modules/ipcrenderer";

ipcRenderer.initialize();
export {ipcRenderer};

export const remote = {
    app: {
        getAppPath: () => "ElectronAppPath"
    },
    getCurrentWindow: () => null,
    getCurrentWebContents: () => ({
        on: () => {}
    })
};

export const shell = {
    openItem: item => {
        const inputEl = DOM.createElement("input", {type: "file", multiple: "multiple"});
        inputEl.addEventListener("change", () => {
            for (const file of inputEl.files) {
                const reader = new FileReader();
                reader.onload = () => {
                    fs.writeFileSync(`AppData/BetterDiscord/${item.split("/").pop()}/${file.name}`, new Uint8Array(reader.result));
                };
                reader.readAsArrayBuffer(file);
            }
        });
        inputEl.click();
    },
    openExternal: () => {}
};

export const clipboard = {
    write: (data) => {
        if (typeof(data) != "object") return;
        if (data.text) {
            clipboard.writeText(data.text);
        }
    },
    writeText: text => navigator.clipboard.writeText(text),
};

export default {
    clipboard,
    ipcRenderer,
    remote,
    shell
};
