/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ../common/constants.js
const IPCEvents = {
  INJECT_CSS: "bdbrowser-inject-css",
  MAKE_REQUESTS: "bdbrowser-make-requests",
  INJECT_THEME: "bdbrowser-inject-theme",
  GET_RESOURCE_URL: "bdbrowser-get-extension-resourceurl"
};
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
DOM.headAppend = document.head.append.bind(document.head);
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
;// CONCATENATED MODULE: ./src/index.js





function initialize() {
  registerEvents();
  Logger.log("Backend", "Initializing modules");

  const SCRIPT_URL = (() => {
    switch ("production") {
      case "production":
        return chrome.runtime.getURL("dist/frontend.js");

      case "development":
        return "http://127.0.0.1:5500/frontend.js";

      default:
        throw new Error("Unknown Environment");
    }
  })();

  injectFrontend(SCRIPT_URL);
}

function injectFrontend(scriptUrl) {
  Logger.log("Backend", "Loading frontend script from:", scriptUrl);
  DOM.injectJS("BetterDiscordBrowser-frontend", scriptUrl, false);
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
    }, function (response) {
      if (response.error) {
        console.error("BdBrowser Backend MAKE_REQUESTS failed:", data.url, response.error);
      } else {
        ipcMain.reply(event, response.body);
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