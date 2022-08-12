import Logger from "common/logger";

export default class Utilities {
    /**
     * Generates an automatically memoizing version of an object.
     * @author Zerebos (https://github.com/BetterDiscord/BetterDiscord)
     * @param {Object} object - object to memoize
     * @returns {Proxy} the proxy to the object that memoizes properties
     */
    static memoizeObject(object) {
        const proxy = new Proxy(object, {
            get: function (obj, mod) {
                if (!obj.hasOwnProperty(mod))
                    return undefined;

                if (Object.getOwnPropertyDescriptor(obj, mod).get) {
                    const value = obj[mod];
                    delete obj[mod];
                    obj[mod] = value;
                }
                return obj[mod];
            },
            set: function (obj, mod, value) {
                if (obj.hasOwnProperty(mod))
                    return Logger.error("MemoizedObject", "Trying to overwrite existing property");
                obj[mod] = value;
                return obj[mod];
            }
        });

        Object.defineProperty(proxy, "hasOwnProperty", {
            value: function (prop) {
                return this[prop] !== undefined;
            }
        });

        return proxy;
    }
}
