export default class Logger {
    static #parseType(type) {
        switch (type) {
            case "info":
            case "warn":
            case "error":
                return type;
            default:
                return "log";
        }
    }

    static #log(type, module, ...message) {
        type = this.#parseType(type);
        // eslint-disable-next-line no-console
        console[type](`%c[BDBrowser]%c %c[${module}]%c`, "color: #3E82E5; font-weight: 700;", "", "color: #396CB8", "", ...message);
    }

    static log(module, ...message) {
        this.#log("log", module, ...message);
    }

    static info(module, ...message) {
        this.#log("info", module, ...message);
    }

    static warn(module, ...message) {
        this.#log("warn", module, ...message);
    }

    static error(module, ...message) {
        this.#log("error", module, ...message);
    }
}
