/**
 * @name arRpcBridge
 * @author tsukasa, OpenAsar
 * @version 0.0.4
 * @description Connect to arRPC, an open Discord RPC server for atypical setups. Loosely based on bridge_mod.js by OpenAsar.
 * @website https://github.com/tsukasa/BdBrowser
 * @source https://github.com/tsukasa/BdBrowser/blob/main/assets/bd-plugins/arRPCBridge.plugin.js
 */

// This plugin is loosely based on bridge_mod.js by OpenAsar, which is licensed under the MIT license.
// See licenses/arrpc/arrpc.txt for more details.

const WEBSOCKET_ADDRESS = "ws://127.0.0.1:1337";
const DISPATCH_TYPE = "LOCAL_ACTIVITY_UPDATE";

module.exports = class arRpcBridgePlugin {
    constructor(meta) {
        this.meta = meta;
        this.api = new BdApi(this.meta.name);

        const {Webpack, Logger} = this.api;

        this.Webpack = Webpack;
        this.Logger = Logger;

        this.Dispatcher = this.Webpack.getModule(m => m.dispatch && m.subscribe);;
        this.AssetManager = this.Webpack.getByKeys("fetchAssetIds", "getAssetImage");
        this.fetchApplicationsRPC = this.Webpack.getByRegex("IPC.*APPLICATION_RPC");

        this.apps = {};
        this.connectErrorNotice = undefined;
        this.currentPid = 0;
        this.currentSocketId = 0;
        this.webSocket = undefined;
        this.pluginIsStarted = false;
    }

    closeNotice() {
        this.connectErrorNotice?.apply();
        this.connectErrorNotice = undefined;
    }

    async getApplication(applicationId) {
        let socket = {};
        await this.fetchApplicationsRPC(socket, applicationId);
        return socket.application;
    }

    async getAsset(applicationId, key) {
        const asset = await this.AssetManager.fetchAssetIds(applicationId, [key, undefined]);
        return asset.find(e => typeof e !== 'undefined');
    }

    onWebSocketCloseHandler = async () => {
        const isConnected = await new Promise(res =>
            setTimeout(() => res(this.webSocket.readyState === WebSocket.OPEN), 1000));

        if (!isConnected) {
            this.Logger.log("Connection to arRPC server failed.");

            if(this.connectErrorNotice)
                return;

            this.connectErrorNotice = this.api.showNotice("Connection to arRPC failed, please ensure the local server is running.", {
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
        this.Logger.info(`Connected to arRPC server via ${WEBSOCKET_ADDRESS}.`);
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

            if (!this.apps[appId])
                this.apps[appId] = await this.getApplication(appId);

            const app = this.apps[appId];

            if(!msg.activity.name)
                msg.activity.name = app.name;
        }

        if(msg.pid)
            this.currentPid = msg.pid;

        if(msg.socketId)
            this.currentSocketId = msg.socketId;

        this.Dispatcher.dispatch({type: DISPATCH_TYPE, ...msg});
    };

    openWebSocketConnection() {
        if(!this.pluginIsStarted)
            return;

        this.webSocket?.close();
        this.webSocket = new WebSocket(WEBSOCKET_ADDRESS);
        this.webSocket.addEventListener("close", this.onWebSocketCloseHandler);
        this.webSocket.addEventListener("open", this.onWebSocketOpenHandler);
        this.webSocket.addEventListener("message", this.onWebSocketMessageHandler);
    }

    start() {
        this.pluginIsStarted = true;

        this.openWebSocketConnection();
    }

    stop() {
        this.pluginIsStarted = false;

        this.closeNotice();

        this.webSocket?.removeEventListener("close", this.onWebSocketCloseHandler);
        this.webSocket?.removeEventListener("open", this.onWebSocketOpenHandler);
        this.webSocket?.removeEventListener("message", this.onWebSocketMessageHandler);
        this.webSocket?.close();

        const emptyActivity = {activity: null, pid: this.currentPid, socketId: this.currentSocketId};
        this.Dispatcher.dispatch({type: DISPATCH_TYPE, ...emptyActivity});
    }
};
