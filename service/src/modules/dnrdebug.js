import Logger from "common/logger";

export function registerOnRuleMatchedDebug() {
    chrome.permissions.contains({ permissions: ["declarativeNetRequestFeedback"] }, enableOnRuleMatchedDebug);
}

export function enableOnRuleMatchedDebug(hasPermission) {
    if(hasPermission) {
        Logger.log("Service", "Registering onRuleMatchedDebug listener.");
        chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(processOnRuleMatchedDebug);
    }
}

export function processOnRuleMatchedDebug(matchedRuleInfo) {
    console.log(`[DEBUG] Matched rule, Initiator: ${matchedRuleInfo.request.initiator}, Requested URL ${matchedRuleInfo.request.url}`);
}