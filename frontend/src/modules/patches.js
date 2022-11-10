import DOM from "common/dom";
import {IPCEvents} from "common/constants";
import Logger from "common/logger";
import ipcRenderer from "./ipc";

const appendMethods = ["append", "appendChild", "prepend"];
const originalInsertBefore = document.head.insertBefore;

document.head.insertBefore = function (node) {
    return originalInsertBefore.apply(this, arguments);
}

function disableSentry() {
    for (const method of Object.keys(console)) {
        if (console[method]?.__sentry_original__) {
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

const unpatchHead = patchMethods(document.head, data => {
    const [node] = data.args;

    if (node?.id === "monaco-style") {
        ipcRenderer.send(IPCEvents.MAKE_REQUESTS, { url: node.href }, data => {
            const dataBody = new TextDecoder().decode(data.body);
            DOM.injectCSS(node.id, dataBody);
            if (typeof node.onload === "function") node.onload();
            Logger.log("CSP:Bypass", "Loaded monaco stylesheet.");
        });

        return node;
    } else if (node?.localName === "bd-head") {
        patchMethods(node, data => {
            const [node] = data.args;

            if (node.localName === "bd-scripts") {
                patchMethods(node, data => {
                    const [node] = data.args;
                    ipcRenderer.send(IPCEvents.MAKE_REQUESTS, { url: node.src }, data => {
                        const dataBody = new TextDecoder().decode(data.body);
                        eval(dataBody);

                        if (typeof node.onload === "function")
                            node.onload();

                        Logger.log("CSP:Bypass", `Loaded script with url ${node.src}`);
                    });
                });
            } else if (node?.localName === "bd-themes") {
                patchMethods(node, data => {
                    const [node] = data.args;

                    if (node.getAttribute("data-bd-native"))
                        return data.callOriginalMethod();

                    injectTheme(node);

                    if (typeof node.onload === "function")
                        node.onload();

                    Logger.log("CSP:Bypass", `Loaded theme ${node.id}`);
                });
            }

            data.callOriginalMethod();
        });
    } else if (node?.src?.includes("monaco-editor")) {
        ipcRenderer.send(IPCEvents.MAKE_REQUESTS, { url: node.src }, data => {
            const dataBody = new TextDecoder().decode(data.body);
            eval(dataBody);

            if (typeof node.onload === "function")
                node.onload();

            Logger.log("CSP:Bypass", `Loaded script with url ${node.src}`);
        });
        return;
    } else if (node?.id?.endsWith("-script-container")) {
        Logger.log("CSP:Bypass", `Loading plugin ${node.id.replace("-script-container", "")}`);

        eval(`(() => {
            try {
                ${node.textContent}
            } catch (e) {
                console.error("Failed to load plugin:", e);
            }
        })()`);

        return;
    }

    return data.callOriginalMethod();
});

function injectTheme(node) {
    ipcRenderer.send(IPCEvents.INJECT_THEME, {id: node.id, css: node.textContent});
}

disableSentry();
