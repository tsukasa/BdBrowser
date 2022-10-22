/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ../common/logger.js
class Logger {
  static _parseType(type) {
    switch (type) {
      case "info":
      case "warn":
      case "error":
        return type;
      default:
        return "log";
    }
  }
  static _log(type, module, ...nessage) {
    type = this._parseType(type);
    console[type](`%c[BDBrowser]%c %c[${module}]%c`, "color: #3E82E5; font-weight: 700;", "", "color: #396CB8", "", ...nessage);
  }
  static log(module, ...message) {
    this._log("log", module, ...message);
  }
  static info(module, ...message) {
    this._log("info", module, ...message);
  }
  static warn(module, ...message) {
    this._log("warn", module, ...message);
  }
  static error(module, ...message) {
    this._log("error", module, ...message);
  }
}
;// CONCATENATED MODULE: ./src/modules/declarativenetrequest.js

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
        operation: cspHeaderValue !== undefined ? "set" : "remove",
        value: cspHeaderValue
      }]
    }
  };
}
function installOrUpdateRules() {
  // Remove the rules before trying to work with the CSP headers!
  // Otherwise, we potentially work with pre-tainted headers...
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: NET_REQUEST_RULE_IDS
  }).then(() => {
    let netRequestRulesList = [];
    netRequestRulesList.push(getBlockWebhookRule());
    netRequestRulesList.push(getAlterContentSecurityPolicyRule());
    Logger.log("Service", "Installing/updating Declarative Net Request rules...");
    chrome.declarativeNetRequest.updateSessionRules({
      addRules: netRequestRulesList
    }).then(() => {
      Logger.log("Service", "Declarative Net Request rules updated!");
    });
  });
}
function removeRules() {
  Logger.log("Service", "Removing Declarative Net Request rules.");
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: NET_REQUEST_RULE_IDS
  });
}
function registerEvents() {
  chrome.runtime.onInstalled.addListener(installOrUpdateRules);
  chrome.runtime.onStartup.addListener(installOrUpdateRules);
  chrome.runtime.onSuspend.addListener(removeRules);
  chrome.runtime.onSuspendCanceled.addListener(installOrUpdateRules);
}
/* harmony default export */ const declarativenetrequest = ({
  registerEvents
});
;// CONCATENATED MODULE: ./src/modules/dnrdebug.js

function dnrdebug_registerEvents() {
  chrome.permissions.contains({
    permissions: ["declarativeNetRequestFeedback"]
  }, enableOnRuleMatchedDebug);
}
function enableOnRuleMatchedDebug(hasPermission) {
  if (hasPermission) {
    Logger.log("Service", "Registering onRuleMatchedDebug listener.");
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(processOnRuleMatchedDebug);
  }
}
function processOnRuleMatchedDebug(matchedRuleInfo) {
  console.log(`[DEBUG] Matched rule, Initiator: ${matchedRuleInfo.request.initiator}, Requested URL ${matchedRuleInfo.request.url}`);
}
/* harmony default export */ const dnrdebug = ({
  registerEvents: dnrdebug_registerEvents
});
;// CONCATENATED MODULE: ./src/modules/fetch.js

function fetch_registerEvents() {
  Logger.log("Service", "Registering Message events.");
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.operation === "fetch") {
      processFetchMessage(request).then(result => sendResponse(result));
      return true;
    }
  });
}
async function processFetchMessage(request) {
  let returnValue;
  try {
    let fetchOptions = request.parameters.options || {};
    let fetchResponse = await fetch(request.parameters.url, fetchOptions);
    let fetchBody = await fetchResponse.arrayBuffer();
    returnValue = {
      body: Array.from(new Uint8Array(fetchBody)),
      headers: Object.fromEntries(fetchResponse.headers),
      ok: fetchResponse.ok,
      redirected: fetchResponse.redirected,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      type: fetchResponse.type,
      url: fetchResponse.url
    };
  } catch (err) {
    returnValue = {
      error: err.toString()
    };
  } finally {
    // noinspection ReturnInsideFinallyBlockJS
    return returnValue;
  }
}
/* harmony default export */ const modules_fetch = ({
  registerEvents: fetch_registerEvents
});
;// CONCATENATED MODULE: ./src/index.js




function initialize() {
  Logger.log("Service", "Initializing service worker...");
  dnrdebug.registerEvents();
  declarativenetrequest.registerEvents();
  modules_fetch.registerEvents();
}
initialize();
/******/ })()
;