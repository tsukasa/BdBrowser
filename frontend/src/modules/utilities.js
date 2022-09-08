import Logger from "common/logger";

export default class Utilities {
    /**
     * Converts an {@link ArrayBuffer} to a base64 string.
     * @param {ArrayBuffer} buffer - The ArrayBuffer to be converted into a base64 string.
     * @returns {string} The base64 string representation of the ArrayBuffer's data.
     */
    static arrayBufferToBase64(buffer) {
        let binaryString = Array.from(buffer).map((chr) => String.fromCharCode(chr)).join('');
        return btoa(binaryString);
    }

    /**
     * Converts a base64 string to an {@link ArrayBuffer}.
     * @param {string} b64String - The base64 string that is to be converted.
     * @returns {Uint8Array} An Uint8Array representation of the data contained within the b64String.
     */
    static base64ToArrayBuffer(b64String) {
        let binaryString = atob(b64String);
        let buffer = new Uint8Array(binaryString.length);
        Array.from(binaryString).forEach((chr, idx) => buffer[idx] = chr.charCodeAt(0));
        return buffer;
    }

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
