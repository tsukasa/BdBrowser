/**
 * This script is injected by `backend.js` into Discord's webpage during
 * document_start to execute early in Discord's (not BetterDiscord's!) loading sequence.
 */
import Logger from "common/logger";

const WEBPACK_CHUNK_NAME = "webpackChunkdiscord_app";

function initialize() {
    prepareWebpackChunk();
}

/**
 * Makes the webpackChunkdiscord_app object configurable,
 * so it can be patched later on.
 *
 * Based on `preload/src/patcher.js` from BetterDiscord.
 */
function prepareWebpackChunk() {
    if (!Reflect.has(window, WEBPACK_CHUNK_NAME)) {
        Logger.log("Preload", `Preparing ${WEBPACK_CHUNK_NAME} to be configurable...`);
        defineObjectProperty(window, WEBPACK_CHUNK_NAME, instance => {
            defineObjectProperty(instance, "push", () => {
                instance.push([[Symbol()], {}, require => {
                    require.d = (target, exports) => {
                        for (const key in exports) {

                            if (!Reflect.has(exports, key) || target[key])
                                continue;

                            Object.defineProperty(target, key, {
                                get: exports[key],
                                enumerable: true,
                                configurable: true
                            });
                        }
                    };
                }]);
                instance.pop();
            });
        });
    }
}

function defineObjectProperty (obj, prop, child) {
    const currentValue = obj[prop];

    Object.defineProperty(obj, prop, {
        get() {
            return currentValue;
        },

        set(newValue) {
            Object.defineProperty(obj, prop, {
                value: newValue,
                configurable: true,
                enumerable: true,
                writable: true
            });

            try {
                child(newValue);
            } catch (error) {
                Logger.error("Preload", `Error while preparing ${WEBPACK_CHUNK_NAME}:\n`, error);
            }

            return newValue;
        },

        configurable: true
    });
}

initialize();
