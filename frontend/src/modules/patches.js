import DOM from "common/dom";
import {IPCEvents} from "common/constants";
import Logger from "common/logger";
import ipcRenderer from "modules/ipc";

const appendMethods = ["append", "appendChild", "prepend"];
const originalInsertBefore = document.head.insertBefore;

(() => {
    document.head.insertBefore = function () {
        return originalInsertBefore.apply(this, arguments);
    };

    disableSentry();
})();

function disableSentry() {
    // eslint-disable-next-line no-console
    for (const method of Object.keys(console)) {
        // eslint-disable-next-line no-console
        if (console[method]?.__sentry_original__) {
            // eslint-disable-next-line no-console
            console[method] = console[method].__sentry_original__;
        }
    }
}

function patchMethods(node, callback) {
    for (const method of appendMethods) {
        const original = node[method];

        node[method] = function () {
            const data = {
                args: arguments,
                callOriginalMethod: () => original.apply(this, arguments)
            };

            return callback(data);
        };

        node[method].__bd_original = original;
    }

    return () => {
        for (const method of appendMethods) {
            const original = node[method].__bd_original;
            if (original) {
                node[method] = original;
            }
        }
    };
}

patchMethods(document.head, data => {
    const [node] = data.args;

    if (node?.id === "monaco-style") {
        ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {url: node.href}, monacoStyleData => {
            const dataBody = new TextDecoder().decode(monacoStyleData.body);
            DOM.injectCSS(node.id, dataBody);
            if (typeof node.onload === "function") node.onload();
            Logger.log("CSP:Bypass", "Loaded monaco stylesheet.");
        });

        return node;
    }
    else if (node?.localName === "bd-head") {
        patchMethods(node, bdHeadData => {
            const [headNode] = bdHeadData.args;

            if (headNode.localName === "bd-scripts") {
                patchMethods(headNode, bdScriptsData => {
                    const [scriptsNode] = bdScriptsData.args;
                    ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {url: scriptsNode.src}, scriptsResponse => {
                        const dataBody = new TextDecoder().decode(scriptsResponse.body);
                        // eslint-disable-next-line no-eval
                        eval(dataBody);
                        if (typeof scriptsNode.onload === "function") scriptsNode.onload();
                        Logger.log("CSP:Bypass", `Loaded script with url ${scriptsNode.src}`);
                    });
                });
            }
            else if (headNode?.localName === "bd-themes") {
                patchMethods(headNode, bdThemesData => {
                    const [nativeNode] = bdThemesData.args;
                    if (nativeNode.getAttribute("data-bd-native")) {
                        return bdThemesData.callOriginalMethod();
                    }
                    injectTheme(nativeNode);
                    if (typeof nativeNode.onload === "function") nativeNode.onload();
                    Logger.log("CSP:Bypass", `Loaded theme ${nativeNode.id}`);
                });
            }

            bdHeadData.callOriginalMethod();
        });
    }
    else if (node?.src?.includes("monaco-editor")) {
        ipcRenderer.send(IPCEvents.MAKE_REQUESTS, {url: node.src}, monacoEditorData => {
            const dataBody = new TextDecoder().decode(monacoEditorData.body);
            // eslint-disable-next-line no-eval
            eval(dataBody);
            if (typeof node.onload === "function") node.onload();
            Logger.log("CSP:Bypass", `Loaded script with url ${node.src}`);
        });
        return;
    }
    else if (node?.id?.endsWith("-script-container")) {
        Logger.log("CSP:Bypass", `Loading plugin ${node.id.replace("-script-container", "")}`);
        // eslint-disable-next-line no-eval
        eval(`(() => {
            try {
                ${node.textContent}
            }
            catch (err) {
                Logger.error("Patches", "Failed to load plugin:", err);
            }
        })()`);
        return;
    }

    return data.callOriginalMethod();
});

function injectTheme(node) {
    ipcRenderer.send(IPCEvents.INJECT_THEME, {id: node.id, css: node.textContent});
}
