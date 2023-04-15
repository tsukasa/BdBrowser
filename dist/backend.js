/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ../common/constants.js
const IPCEvents = {
  GET_MANIFEST_INFO: "bdbrowser-get-extension-manifest",
  GET_RESOURCE_URL: "bdbrowser-get-extension-resourceurl",
  GET_EXTENSION_OPTIONS: "bdbrowser-get-extension-options",
  SET_EXTENSION_OPTIONS: "bdbrowser-set-extension-options",
  INJECT_CSS: "bdbrowser-inject-css",
  INJECT_THEME: "bdbrowser-inject-theme",
  MAKE_REQUESTS: "bdbrowser-make-requests"
};
const FilePaths = {
  BD_ASAR_PATH: "AppData/BetterDiscord/data/betterdiscord.asar",
  BD_ASAR_VERSION_PATH: "AppData/BetterDiscord/data/bd-asar-version.txt",
  BD_CONFIG_PLUGINS_PATH: "AppData/BetterDiscord/data/&1/plugins.json"
};
/* harmony default export */ const constants = ({
  IPCEvents,
  FilePaths
});
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
      if (returnValue === true && once) window.removeEventListener("message", wrappedListener);
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
  sendAwait(event, data, hash) {
    return new Promise(resolve => {
      const callback = data => {
        resolve(data);
      };
      this.send(event, data, callback, hash);
    });
  }
}
;// CONCATENATED MODULE: ../common/logger.js
class Logger {
  static #parseType(type) {
    switch (type) {
      case "info":
      case "warn":
      case "error":
        return type;
      default:
        return "log";
    }
  }
  static #log(type, module, ...message) {
    type = this.#parseType(type);
    console[type](`%c[BDBrowser]%c %c[${module}]%c`, "color: #3E82E5; font-weight: 700;", "", "color: #396CB8", "", ...message);
  }
  static log(module, ...message) {
    this.#log("log", module, ...message);
  }
  static info(module, ...message) {
    this.#log("info", module, ...message);
  }
  static warn(module, ...message) {
    this.#log("warn", module, ...message);
  }
  static error(module, ...message) {
    this.#log("error", module, ...message);
  }
}
;// CONCATENATED MODULE: ./src/modules/loadingScreen.js
function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }
function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
const LOADING_ANIMATION_SELECTOR = `video[data-testid="app-spinner"]`;
class LoadingScreen {
  /**
   * Inserts the custom loading screen spinner animation from
   * `assets/spinner.webm` into the playlist.
   *
   * If the file cannot be found, the video player will automatically
   * choose one of the default Discord animations.
   */
  static ReplaceLoadingAnimation() {
    _classStaticPrivateFieldSpecGet(this, LoadingScreen, _loadingObserver).observe(document, {
      childList: true,
      subtree: true
    });
  }
}
var _loadingObserver = {
  writable: true,
  value: new MutationObserver(mutations => {
    if (document.readyState === "complete") _classStaticPrivateFieldSpecGet(LoadingScreen, LoadingScreen, _loadingObserver).disconnect();
    let loadingAnimationElement = document.querySelector(LOADING_ANIMATION_SELECTOR);
    if (loadingAnimationElement) {
      _classStaticPrivateFieldSpecGet(LoadingScreen, LoadingScreen, _loadingObserver).disconnect();

      // Should be a WebM file with VP9 codec (400px x 400px) so the alpha channel gets preserved.
      let customAnimationSource = document.createElement("source");
      customAnimationSource.src = chrome.runtime.getURL("assets/spinner.webm");
      customAnimationSource.type = "video/webm";
      loadingAnimationElement.prepend(customAnimationSource);
    }
  })
};
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
  LoadingScreen.ReplaceLoadingAnimation();
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
  ipcMain.on(IPCEvents.GET_MANIFEST_INFO, event => {
    ipcMain.reply(event, chrome.runtime.getManifest());
  });
  ipcMain.on(IPCEvents.GET_RESOURCE_URL, (event, data) => {
    ipcMain.reply(event, chrome.runtime.getURL(data.url));
  });
  ipcMain.on(IPCEvents.GET_EXTENSION_OPTIONS, event => {
    chrome.storage.sync.get({
      disableBdRenderer: false,
      disableBdPluginsOnReload: false,
      deleteBdRendererOnReload: false
    }, options => {
      ipcMain.reply(event, options);
    });
  });
  ipcMain.on(IPCEvents.SET_EXTENSION_OPTIONS, (event, data) => {
    chrome.storage.sync.set(data, () => {
      Logger.log("Backend", "Saved extension options:", data);
    });
  });
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
      try {
        if (response.error) {
          if (!data.url.startsWith(chrome.runtime.getURL(""))) console.error("BdBrowser Backend MAKE_REQUESTS failed:", data.url, response.error);
          ipcMain.reply(event, undefined);
        } else {
          // Response body comes in as a normal array, so requires
          // another round of casting into Uint8Array for the buffer.
          response.body = new Uint8Array(response.body).buffer;
          ipcMain.reply(event, response);
        }
      } catch (error) {
        Logger.error("Backend", "MAKE_REQUESTS failed:", error, data.url, response);
        ipcMain.reply(event, undefined);
      }
    });
  });
}
initialize();
/******/ })()
;