/**
 * This script is injected by `backend.js` into Discord's webpage during
 * document_start to execute early in Discord's (not BetterDiscord's!) loading sequence.
 */
import Logger from "common/logger";

/**
 * This code is taken from BetterDiscord's preload/src/patcher.js.
 * Keep it as vanilla as possible to make it easier to update.
 */
(() =>{
    const chunkName = "webpackChunkdiscord_app";
    const predefine = function (target, prop, effect) {
        const value = target[prop];
        Object.defineProperty(target, prop, {
            get() {return value;},
            set(newValue) {
                Object.defineProperty(target, prop, {
                    value: newValue,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });

                try {
                    effect(newValue);
                }
                catch (error) {
                    Logger.error("Preload", error);
                }

                // eslint-disable-next-line no-setter-return
                return newValue;
            },
            configurable: true
        });
    };

    if (Reflect.has(window, "localStorage")) {
        Logger.log("Preload", "Saving instance of localStorage for internal use...");

        // Normally this should be considered problematic, however the bdbrowserLocalStorage
        // will be picked up and deleted by the LocalStorage class in the frontend.
        window.bdbrowserLocalStorage = window.localStorage;
    }

    if (!Reflect.has(window, chunkName)) {
        Logger.log("Preload", `Preparing ${chunkName} to be configurable...`);

        predefine(window, chunkName, instance => {
            instance.push([[Symbol()], {}, require => {
                require.d = (target, exports) => {
                    for (const key in exports) {
                        if (!Reflect.has(exports, key)) continue;

                        try {
                            Object.defineProperty(target, key, {
                                get: () => exports[key](),
                                set: v => {exports[key] = () => v;},
                                enumerable: true,
                                configurable: true
                            });
                        }
                        catch (error) {
                            Logger.error("Preload", error);
                        }
                    }
                };
            }]);
        });
    }
})();
