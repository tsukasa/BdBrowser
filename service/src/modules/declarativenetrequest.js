import Logger from "common/logger";

const DISCORD_APP_DOMAINS = ["discord.com", "canary.discord.com", "ptb.discord.com"];
const NET_REQUEST_RULE_IDS = [1, 2];

// Rule blocks any Discord webhook being accessed/called from within Discord's domains.
// Same thing renderer/src/secure.js from BetterDiscord does but via dNR.
function getBlockWebhookRule() {
    return {
        id: NET_REQUEST_RULE_IDS[0],
        priority: 100,
        condition: {
            initiatorDomains: DISCORD_APP_DOMAINS.concat([location.hostname]),
            regexFilter: "(http|https):\/\/discord\.com\/api\/webhooks\/.*"
        },
        action: {
            type: "block"
        }
    };
}

// Rule removes/eases the Content Security Policy from Discord's domains.
// Same thing injector/src/modules/csp.js from BetterDiscord does but via dNR.
function getAlterContentSecurityPolicyRule(cspHeaderValue) {
    return {
        id: NET_REQUEST_RULE_IDS[1],
        priority: 100,
        condition: {
            requestDomains: DISCORD_APP_DOMAINS,
            // resourceTypes needs to be set for this to work!
            resourceTypes: ["main_frame"]
        },
        action: {
            type: "modifyHeaders",
            responseHeaders: [{
                header: "Content-Security-Policy",
                operation: ((cspHeaderValue !== undefined) ? "set" : "remove"),
                value: cspHeaderValue
            }]
        }
    };
}

function installOrUpdateRules() {
    // Remove the rules before trying to work with the CSP headers!
    // Otherwise, we potentially work with pre-tainted headers...
    chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: NET_REQUEST_RULE_IDS }).then(() => {
        let netRequestRulesList = [];
        netRequestRulesList.push(getBlockWebhookRule());
        netRequestRulesList.push(getAlterContentSecurityPolicyRule());

        Logger.log("Service", "Installing/updating Declarative Net Request rules...");
        chrome.declarativeNetRequest.updateSessionRules({ addRules: netRequestRulesList }).then(() => {
            Logger.log("Service", "Declarative Net Request rules updated!");
        });
    });
}

function removeRules() {
    Logger.log("Service", "Removing Declarative Net Request rules.");
    chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: NET_REQUEST_RULE_IDS });
}

function registerEvents() {
    chrome.runtime.onInstalled.addListener(installOrUpdateRules);
    chrome.runtime.onStartup.addListener(installOrUpdateRules);
    chrome.runtime.onSuspend.addListener(removeRules);
    chrome.runtime.onSuspendCanceled.addListener(installOrUpdateRules);
}

export default {
    registerEvents
}