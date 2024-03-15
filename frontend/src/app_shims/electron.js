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
    openItem: () => {},
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
