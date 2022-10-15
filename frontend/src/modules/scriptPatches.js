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

/**
 * Patches the wonky import of BetterDiscord's `renderer/src/modules/updater.js`
 * to use BdBrowser's implementation of the "path" module.
 * If not patched, the updater will be dysfunctional in BdBrowser due to missing imports.
 * @param {string} scriptBody - A string containing the script body of the renderer to patch.
 * @returns {string} - The patched script body of the renderer.
 */
export function fixUpdaterPathRequire(scriptBody) {
    try {
        // First, identify the call we use to work our way backwards...
        const identifyFunctionNameCall = scriptBody.match(/this\.cache\[(.*?)\.basename/).at(-1);

        // Remove the parenthesis from the function name match
        const pathFunctionName = identifyFunctionNameCall.replace("()", "");

        // Now build the regular expression to replace the group content
        const pathImportRegex = new RegExp(`${pathFunctionName}=(.*?);`);
        const pathImport = scriptBody.match(pathImportRegex).at(-1);

        // Finally, replace the group content with an anonymous function for require("path")
        return scriptBody.replace(pathImport, '() => require("path")');
    } catch (error) {
        Logger.error("ScriptPatcher", "Failed to patch the \"path\" import in the updater:\n", error);
        return scriptBody;
    }
}
