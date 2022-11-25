/**
 * @name arRpcBridge
 * @author tsukasa, OpenAsar
 * @version 0.0.1
 * @description Connect to arRPC, an open Discord RPC server for atypical setups. Loosely based on bridge_mod.js by OpenAsar.
 */

// This plugin is loosely based on bridge_mod.js by OpenAsar, which is licensed under the MIT license.
// See licenses/arrpc/arrpc.txt for more details.

module.exports = (() => {
    const config = {
        "info": {
            "name": "arRpcBridge",
            "authors": [
                {
                    "name": "tsukasa",
                    "github_username": "tsukasa"
                },
                {
                    "name": "OpenAsar",
                    "github_username": "OpenAsar"
                }
            ],
            "version": "0.0.1",
            "description": "Connect to arRPC, an open Discord RPC server for atypical setups. Loosely based on bridge_mod.js by OpenAsar."
        }
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }

        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }

        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const { DiscordModules, Logger } = Api;
            const { Dispatcher } = DiscordModules;
            const { Webpack } = BdApi;

            const WEBSOCKET_ADDRESS = "ws://127.0.0.1:1337";
            const DISPATCH_TYPE = "LOCAL_ACTIVITY_UPDATE";

            const AssetManager = Webpack.getModule(m => Object.values(m)
                .toString().includes("getAssetImage"));
            AssetManager.getAsset = Object.values(AssetManager)
                .find(f => typeof f === "function" && f.toString().includes("apply"));

            const ApplicationManager = Webpack.getModule(m => Object.values(m)
                .toString().includes("e.application={"));
            ApplicationManager.getApplication = Object.values(ApplicationManager)
                .find(f => typeof f === "function" && f.toString().includes("e.application={"));

            let apps = {};
            let connectErrorNotice;
            let currentPid;
            let currentSocketId;
            let webSocket;
            let pluginIsStarted = false;

            return class arRpcBridgePlugin extends Plugin {
                closeNotice() {
                    connectErrorNotice?.apply();
                    connectErrorNotice = undefined;
                }

                async getApplication(applicationId) {
                    let socket = {};
                    await ApplicationManager.getApplication(socket, applicationId);
                    return socket.application;
                }

                async getAsset(applicationId, key) {
                    const asset = await AssetManager.getAsset(applicationId, [key, undefined]);
                    return asset.find(e => typeof e !== 'undefined');
                }

                onWebSocketCloseHandler = async () => {
                    const isConnected = await new Promise(res =>
                        setTimeout(() => res(webSocket.readyState === WebSocket.OPEN), 1000));

                    if (!isConnected) {
                        Logger.log("Connection to arRPC server failed.");

                        if(connectErrorNotice)
                            return;

                        connectErrorNotice = BdApi.showNotice("Connection to arRPC failed, please ensure the local server is running.", {
                            type: "error",
                            buttons: [{
                                label: "Connect",
                                onClick: () => {
                                    this.closeNotice();
                                    this.openWebSocketConnection();
                                }
                            }]
                        });
                    }
                };

                onWebSocketOpenHandler = (event) => {
                    Logger.info(`Connected to arRPC server via ${WEBSOCKET_ADDRESS}.`);
                }

                onWebSocketMessageHandler = async (event) => {
                    const msg = JSON.parse(event.data);

                    if (msg.activity?.assets?.large_image)
                        msg.activity.assets.large_image =
                            await this.getAsset(msg.activity.application_id, msg.activity.assets.large_image);

                    if (msg.activity?.assets?.small_image)
                        msg.activity.assets.small_image =
                            await this.getAsset(msg.activity.application_id, msg.activity.assets.small_image);

                    if (msg.activity) {
                        const appId = msg.activity.application_id;

                        if (!apps[appId])
                            apps[appId] = await this.getApplication(appId);

                        const app = apps[appId];

                        if(!msg.activity.name)
                            msg.activity.name = app.name;
                    }

                    if(msg.pid)
                        currentPid = msg.pid;

                    if(msg.socketId)
                        currentSocketId = msg.socketId;

                    Logger.info(`Setting activity to: ${msg.activity.name || "nothing"}`);
                    Dispatcher.dispatch({ type: DISPATCH_TYPE, ...msg });
                };

                openWebSocketConnection() {
                    if(!pluginIsStarted)
                        return;

                    webSocket?.close();
                    webSocket = new WebSocket(WEBSOCKET_ADDRESS);
                    webSocket.addEventListener("close", this.onWebSocketCloseHandler);
                    webSocket.addEventListener("open", this.onWebSocketOpenHandler);
                    webSocket.addEventListener("message", this.onWebSocketMessageHandler);
                }

                onStart() {
                    pluginIsStarted = true;

                    this.openWebSocketConnection();
                }

                onStop() {
                    pluginIsStarted = false;

                    this.closeNotice();

                    webSocket?.removeEventListener("close", this.onWebSocketCloseHandler);
                    webSocket?.removeEventListener("open", this.onWebSocketOpenHandler);
                    webSocket?.removeEventListener("message", this.onWebSocketMessageHandler);
                    webSocket?.close();

                    const emptyActivity = { activity: null, pid: currentPid, socketId: currentSocketId };
                    Dispatcher.dispatch({ type: DISPATCH_TYPE, ...emptyActivity });
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
