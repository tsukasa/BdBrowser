export default class Events {

    constructor() {
        this.eventListeners = {};
    }

    static get EventEmitter() {
        return Events;
    }

    dispatch(event, ...args) {
        this.emit(event, ...args);
    }

    emit(event, ...args) {
        if (!this.eventListeners[event])
            return;

        this.eventListeners[event].forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`[BetterDiscord] Could not fire event [${event}] for ${listener.toString().slice(0, 20)}:`, error);
            }
        });
    }

    on(event, callback) {
        if (!this.eventListeners[event])
            this.eventListeners[event] = new Set();

        this.eventListeners[event].add(callback);
    }

    off(event, callback) {
        return this.removeListener(event, callback);
    }

    removeListener(event, callback) {
        if (!this.eventListeners[event])
            return;

        this.eventListeners[event].delete(callback);
    }

    setMaxListeners() {

    }
};
