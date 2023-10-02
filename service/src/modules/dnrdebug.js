import Logger from "common/logger";

function registerEvents() {
    chrome.permissions.contains({permissions: ["declarativeNetRequestFeedback"]}, enableOnRuleMatchedDebug);
}

function enableOnRuleMatchedDebug(hasPermission) {
    if (hasPermission) {
        Logger.log("Service", "Registering onRuleMatchedDebug listener.");
        chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(processOnRuleMatchedDebug);
    }
}

function processOnRuleMatchedDebug(matchedRuleInfo) {
    Logger.log("Debug", `Matched rule, Initiator: ${matchedRuleInfo.request.initiator}, Requested URL ${matchedRuleInfo.request.url}`);
}

export default {
    registerEvents
};
