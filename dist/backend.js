/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ../common/dom.js
class DOM {
  /**@returns {HTMLElement} */
  static createElement(type, options = {}, ...children) {
    const node = document.createElement(type);
    Object.assign(node, options);
    for (const child of children) {
      node.append(child);
    }
    return node;
  }
  static injectTheme(id, css) {
    const [bdThemes] = document.getElementsByTagName("bd-themes");
    const style = this.createElement("style", {
      id: id,
      type: "text/css",
      innerHTML: css
    });
    style.setAttribute("data-bd-native", "");
    bdThemes.append(style);
  }
  static injectCSS(id, css) {
    const style = this.createElement("style", {
      id: id,
      type: "text/css",
      innerHTML: css
    });
    this.headAppend(style);
  }
  static removeCSS(id) {
    const style = document.querySelector("style#" + id);
    if (style) {
      style.remove();
    }
  }
  static injectJS(id, src, silent = true) {
    const script = this.createElement("script", {
      id: id,
      type: "text/javascript",
      src: src
    });
    this.headAppend(script);
    if (silent) script.addEventListener("load", () => {
      script.remove();
    }, {
      once: true
    });
  }
}
const callback = () => {
  if (document.readyState !== "complete") return;
  document.removeEventListener("readystatechange", callback);
  DOM.headAppend = document.head.append.bind(document.head);
};
if (document.readyState === "complete") DOM.headAppend = document.head.append.bind(document.head);else document.addEventListener("readystatechange", callback);
;// CONCATENATED MODULE: ../common/ipc.js
const IPC_REPLY_SUFFIX = "-reply";
class IPC {
  constructor(context) {
    if (!context) throw new Error("Context is required");
    this.context = context;
  }
  createHash() {
    return Math.random().toString(36).substring(2, 10);
  }
  reply(message, data) {
    this.send(message.event.concat(IPC_REPLY_SUFFIX), data, void 0, message.hash);
  }
  on(event, listener, once = false) {
    const wrappedListener = message => {
      if (message.data.event !== event || message.data.context === this.context) return;
      const returnValue = listener(message.data, message.data.data);
      if (returnValue === true && once) {
        window.removeEventListener("message", wrappedListener);
      }
    };
    window.addEventListener("message", wrappedListener);
  }
  send(event, data, callback = null, hash) {
    if (!hash) hash = this.createHash();
    if (callback) {
      this.on(event.concat(IPC_REPLY_SUFFIX), message => {
        if (message.hash === hash) {
          callback(message.data);
          return true;
        }
        return false;
      }, true);
    }
    window.postMessage({
      source: "betterdiscord-browser".concat("-", this.context),
      event: event,
      context: this.context,
      hash: hash,
      data
    });
  }
}
;
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
;// CONCATENATED MODULE: ../common/constants.js
const IPCEvents = {
  INJECT_CSS: "bdbrowser-inject-css",
  MAKE_REQUESTS: "bdbrowser-make-requests",
  INJECT_THEME: "bdbrowser-inject-theme",
  GET_RESOURCE_URL: "bdbrowser-get-extension-resourceurl"
};
;// CONCATENATED MODULE: ./src/modules/loadingScreen.js
const LOADING_ANIMATION_SELECTOR = `video[data-testid="app-spinner"]`;
const loadingObserver = new MutationObserver(mutations => {
  if (document.readyState === "complete") loadingObserver.disconnect();
  let loadingAnimationElement = document.querySelector(LOADING_ANIMATION_SELECTOR);
  if (loadingAnimationElement) {
    loadingObserver.disconnect();

    // Should be a WebM file with VP9 codec (400px x 400px) so the alpha channel gets preserved.
    let customAnimationSource = document.createElement("source");
    customAnimationSource.src = chrome.runtime.getURL("assets/spinner.webm");
    customAnimationSource.type = "video/webm";
    loadingAnimationElement.prepend(customAnimationSource);
  }
});

/**
 * Inserts the custom loading screen spinner animation from
 * `assets/spinner.webm` into the playlist.
 *
 * If the file cannot be found, the video player will automatically
 * choose one of the default Discord animations.
 * @constructor
 */
const ReplaceLoadingAnimation = () => {
  loadingObserver.observe(document, {
    childList: true,
    subtree: true
  });
};
const loadingScreen = {
  ReplaceLoadingAnimation
};
/* harmony default export */ const modules_loadingScreen = (loadingScreen);
;// CONCATENATED MODULE: ./src/index.js






/**
 * Initializes the "backend" side of BdBrowser.
 * Some parts need to fire early (document_start) in order to patch
 * objects in Discord's DOM while other parts are to be fired later
 * (document_idle) after the page has loaded.
 */
function initialize() {
  const doOnDocumentComplete = () => {
    registerEvents();
    Logger.log("Backend", "Initializing modules.");
    injectFrontend(chrome.runtime.getURL("dist/frontend.js"));
  };
  const documentCompleteCallback = () => {
    if (document.readyState !== "complete") return;
    document.removeEventListener("readystatechange", documentCompleteCallback);
    doOnDocumentComplete();
  };

  // Preload should fire as early as possible and is the reason for
  // running the backend during `document_start`.
  injectPreload();
  if (document.readyState === "complete") doOnDocumentComplete();else document.addEventListener("readystatechange", documentCompleteCallback);
  modules_loadingScreen.ReplaceLoadingAnimation();
}

/**
 * Injects the Frontend script into the page.
 * Should fire when the page is complete (document_idle).
 * @param {string} scriptUrl - Internal URL to the script
 */
function injectFrontend(scriptUrl) {
  Logger.log("Backend", "Loading frontend script from:", scriptUrl);
  DOM.injectJS("BetterDiscordBrowser-frontend", scriptUrl, false);
}

/**
 * Injects the Preload script into the page.
 * Should fire as soon as possible (document_start).
 */
function injectPreload() {
  Logger.log("Backend", "Injecting preload.js into document to prepare environment...");
  const scriptElement = document.createElement("script");
  scriptElement.src = chrome.runtime.getURL("dist/preload.js");
  (document.head || document.documentElement).appendChild(scriptElement);
}
function registerEvents() {
  Logger.log("Backend", "Registering events.");
  const ipcMain = new IPC("backend");
  ipcMain.on(IPCEvents.INJECT_CSS, (_, data) => {
    DOM.injectCSS(data.id, data.css);
  });
  ipcMain.on(IPCEvents.INJECT_THEME, (_, data) => {
    DOM.injectTheme(data.id, data.css);
  });
  ipcMain.on(IPCEvents.MAKE_REQUESTS, (event, data) => {
    // If the data is an object instead of a string, we probably
    // deal with a "request"-style request and have to re-order
    // the options.
    if (data.url && typeof data.url === "object") {
      // Deep clone data.url into the options and remove the url
      data.options = JSON.parse(JSON.stringify(data.url));
      data.options.url = undefined;
      if (data.url.url) data.url = data.url.url;
    }
    chrome.runtime.sendMessage({
      operation: "fetch",
      parameters: {
        url: data.url,
        options: data.options
      }
    }, response => {
      if (response.error) {
        console.error("BdBrowser Backend MAKE_REQUESTS failed:", data.url, response.error);
      } else {
        // Response body comes in as a normal array, so requires
        // another round of casting into Uint8Array for the buffer.
        response.body = new Uint8Array(response.body).buffer;
        ipcMain.reply(event, response);
      }
    });
  });
  ipcMain.on(IPCEvents.GET_RESOURCE_URL, (event, data) => {
    ipcMain.reply(event, chrome.runtime.getURL(data.url));
  });
}
initialize();
/******/ })()
;