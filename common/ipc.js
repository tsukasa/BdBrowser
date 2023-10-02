const IPC_REPLY_SUFFIX = "-reply";

export default class IPC {
    constructor(context) {
        if (!context) {
            throw new Error("Context is required");
        }

        this.context = context;
    }

    createHash() {
        return Math.random().toString(36).substring(2, 10);
    }

    reply(message, data) {
        this.send(message.event.concat(IPC_REPLY_SUFFIX), data, void 0, message.hash);
    }

    on(event, listener, once = false) {
        const wrappedListener = (message) => {
            if (message.data.event !== event || message.data.context === this.context) {
                return;
            }

            const returnValue = listener(message.data, message.data.data);

            if (returnValue === true && once) {
                window.removeEventListener("message", wrappedListener);
            }
        };

        window.addEventListener("message", wrappedListener);
    }

    send(event, data, callback = null, hash) {
        if (!hash) {
            hash = this.createHash();
        }

        if (callback) {
            this.on(event.concat(IPC_REPLY_SUFFIX), message => {
                if (message.hash === hash) {
                    callback(message.data);
                    return true;
                }

                return false;
            }, true);
        }

        window.postMessage({
            source: "betterdiscord-browser".concat("-", this.context),
            event: event,
            context: this.context,
            hash: hash,
            data
        });
    }

    sendAwait(event, data, hash) {
        return new Promise((resolve) => {
            const callback = (d) => {
                resolve(d);
            };

            this.send(event, data, callback, hash);
        });
    }
}
