import Logger from "common/logger";

/**
 * Patches the `window.require` override done in BetterDiscord's
 * `renderer/src/polyfill/index.js` so a custom `require()` logic
 * provided by BdBrowser can be used.
 * @param {string} scriptBody - A string containing the script body of the renderer to patch.
 * @returns {string} - The patched script body of the renderer.
 */
export function fixWindowRequire(scriptBody) {
    return scriptBody.replace(/=window.require=.*?;/, "=window.require;");
}
