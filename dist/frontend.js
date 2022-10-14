/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 65:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "A": () => (/* binding */ IPCEvents)
/* harmony export */ });
const IPCEvents = {
  INJECT_CSS: "bdbrowser-inject-css",
  MAKE_REQUESTS: "bdbrowser-make-requests",
  INJECT_THEME: "bdbrowser-inject-theme",
  GET_RESOURCE_URL: "bdbrowser-get-extension-resourceurl"
};

/***/ }),

/***/ 706:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ DOM)
/* harmony export */ });
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

/***/ }),

/***/ 602:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ Logger)
/* harmony export */ });
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

/***/ }),

/***/ 229:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ ipc)
});

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
;// CONCATENATED MODULE: ./src/ipc.js

const ipcRenderer = new IPC("frontend");
/* harmony default export */ const ipc = (ipcRenderer);

/***/ }),

/***/ 154:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _https__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(183);
/* harmony import */ var _path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(878);
/* harmony import */ var _fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(432);




const bdPreloadCatalogue = {
  electron: _electron__WEBPACK_IMPORTED_MODULE_0__,
  filesystem: {
    readFile: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.readFileSync */ .ZP.readFileSync,
    writeFile: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.writeFileSync */ .ZP.writeFileSync,
    readDirectory: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.readdirSync */ .ZP.readdirSync,
    createDirectory: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.mkdirSync */ .ZP.mkdirSync,
    deleteDirectory: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.rmdirSync */ .ZP.rmdirSync,
    exists: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.existsSync */ .ZP.existsSync,
    getRealPath: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.realpathSync */ .ZP.realpathSync,
    rename: () => {},
    watch: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.watch */ .ZP.watch,
    getStats: _fs__WEBPACK_IMPORTED_MODULE_3__/* .default.statSync */ .ZP.statSync
  },
  https: _https__WEBPACK_IMPORTED_MODULE_1__,
  path: _path__WEBPACK_IMPORTED_MODULE_2__
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bdPreloadCatalogue);

/***/ }),

/***/ 828:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(343);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  /* Current User Info, State and Settings */
  get ThemeStore() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("addChangeListener", "theme");
  },

  /* User Stores and Utils */
  get UserStore() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("getCurrentUser", "getUser");
  },

  /* Electron & Other Internals with Utils */
  get ElectronModule() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("setBadge");
  },

  get Dispatcher() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("dispatch", "subscribe", "wait", "unsubscribe", "register");
  },

  get RouterModule() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("listeners", "rewrites", "flushRoute");
  },

  /* Other Utils */
  get StorageModule() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("get", "set", "stringify");
  },

  /* Stuff for the Preloader */
  get Buffer() {
    return webpack__WEBPACK_IMPORTED_MODULE_0__.default.getByProps("INSPECT_MAX_BYTES");
  }

});

/***/ }),

/***/ 735:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "app": () => (/* binding */ app),
/* harmony export */   "globals": () => (/* binding */ globals)
/* harmony export */ });
/* harmony import */ var _process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(323);

const app = {
  getReleaseChannel() {
    return globals.releaseChannel;
  },

  getVersion() {
    return "1.0.9006";
  },

  async getPath(path) {
    switch (path) {
      case "appData":
        return _process__WEBPACK_IMPORTED_MODULE_0__/* .default.env.APPDATA */ .Z.env.APPDATA;

      default:
        throw new Error("Cannot find path: " + path);
    }
  },

  relaunch() {
    location.reload();
  }

};
const globals = {
  get releaseChannel() {
    if (location.href.includes("canary")) return "canary";
    if (location.href.includes("ptb")) return "ptb";
    return "stable";
  }

};

/***/ }),

/***/ 8:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "clipboard": () => (/* binding */ clipboard),
  "ipcRenderer": () => (/* reexport */ IPCRenderer),
  "remote": () => (/* binding */ remote),
  "shell": () => (/* binding */ shell)
});

// EXTERNAL MODULE: ../common/dom.js
var dom = __webpack_require__(706);
// EXTERNAL MODULE: ./src/modules/discordmodules.js
var discordmodules = __webpack_require__(828);
;// CONCATENATED MODULE: ./src/modules/ipcRenderer.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

 // https://developer.mozilla.org/en/docs/Web/API/Page_Visibility_API

const [ipcRenderer_hidden, visibilityChange] = (() => {
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    return ["hidden", "visibilitychange"];
  } else if (typeof document.msHidden !== "undefined") {
    return ["msHidden", "msvisibilitychange"];
  } else if (typeof document.webkitHidden !== "undefined") {
    return ["webkitHidden", "webkitvisibilitychange"];
  }
})();

class IPCRenderer {
  static addWindowListeners() {
    document.addEventListener(visibilityChange, () => {
      if (document[ipcRenderer_hidden]) {
        this.fire("bd-window-maximize");
      } else {
        this.fire("bd-window-minimize");
      }
    });
  }

  static createEvent(event) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
  }

  static fire(event, ...args) {
    if (this.listeners[event]) {
      for (const listener of this.listeners[event]) {
        listener(...args);
      }
    }
  }

  static initialize() {
    this.addWindowListeners();
  }

  static async invoke(event) {
    console.log("INVOKE:", event);

    switch (event) {
      case "bd-config":
        return {
          version: "0.6.0",
          local: false,
          localPath: "",
          branch: "development",
          bdVersion: "1.0.0",
          minSupportedVersion: "0.3.0",
          hash: "gh-pages",
          dataPath: "AppData/BetterDiscord/"
        };

      case "bd-injector-info":
        return {
          version: "1.0.0"
        };

      default:
        null;
    }
  }

  static on(event, callback) {
    switch (event) {
      case "bd-did-navigate-in-page":
        return this.onSwitch(callback);

      default:
        this.createEvent(event);
        this.listeners[event].add(callback);
    }
  }

  static onSwitch(callback) {
    discordmodules/* default.RouterModule.listeners.add */.Z.RouterModule.listeners.add(callback);
  }

  static send(event, ...args) {
    console.log("SEND:", event, args);
  }

}

_defineProperty(IPCRenderer, "listeners", {});
;// CONCATENATED MODULE: ./src/modules/electron.js


IPCRenderer.initialize();

const remote = {
  app: {
    getAppPath: () => "ElectronAppPath"
  },
  getCurrentWindow: () => null,
  getCurrentWebContents: () => ({
    on: () => {}
  })
};
const shell = {
  openItem: item => {
    const inputEl = dom/* default.createElement */.Z.createElement("input", {
      type: "file",
      multiple: "multiple"
    });
    inputEl.addEventListener("change", () => {
      for (const file of inputEl.files) {
        const reader = new FileReader();

        reader.onload = () => {
          fs.writeFileSync(`AppData/BetterDiscord/${item.split("/").pop()}/${file.name}`, new Uint8Array(reader.result));
        };

        reader.readAsArrayBuffer(file);
      }
    });
    inputEl.click();
  },
  openExternal: () => {}
};
const clipboard = {
  write: (data, type) => {
    if (typeof data != "object") return;
    if (data.text) clipboard.writeText(data.text);
  },
  writeText: text => navigator.clipboard.writeText(text)
};

/***/ }),

/***/ 287:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ Events)
/* harmony export */ });
class Events {
  constructor() {
    this.eventListeners = {};
  }

  static get EventEmitter() {
    return Events;
  }

  dispatch(event, ...args) {
    this.emit(event, ...args);
  }

  emit(event, ...args) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`[BetterDiscord] Could not fire event [${event}] for ${listener.toString().slice(0, 20)}:`, error);
      }
    });
  }

  on(event, callback) {
    if (!this.eventListeners[event]) this.eventListeners[event] = new Set();
    this.eventListeners[event].add(callback);
  }

  off(event, callback) {
    return this.removeListener(event, callback);
  }

  removeListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].delete(callback);
  }

  setMaxListeners() {}

}
;

/***/ }),

/***/ 551:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ fetch)
/* harmony export */ });
/* harmony import */ var common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(229);


function fetch(url) {
  return new Promise(resolve => {
    _ipc__WEBPACK_IMPORTED_MODULE_1__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_0__/* .IPCEvents.MAKE_REQUESTS */ .A.MAKE_REQUESTS, {
      url
    }, data => {
      resolve(new Response(data, {
        url
      }));
    });
  });
}

/***/ }),

/***/ 432:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "ZP": () => (/* binding */ modules_fs),
  "AH": () => (/* binding */ normalizePath)
});

// UNUSED EXPORTS: basename, dumpVfsCache, exists, existsSync, initializeVfs, mkdir, mkdirSync, readFile, readFileSync, readdirSync, rm, rmSync, rmdir, rmdirSync, statSync, unlink, unlinkSync, watch, writeFile, writeFileSync

// EXTERNAL MODULE: ./src/modules/events.js
var events = __webpack_require__(287);
;// CONCATENATED MODULE: ./src/modules/fsBuffer.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * A {@link TypedArray} for holding data retrieved from the VFS.
 * Internally all data is being handled as a {@link Uint8Array}, however when
 * returning data via {@link fs.readFileSync}, it needs to be handled slightly
 * different. The {@link VfsBuffer.toString} method returns a string while
 * Uint8Array's toString method returns a joined list of array values.
 */
class VfsBuffer extends Uint8Array {
  toString() {
    let textDecoder = new TextDecoder();
    return textDecoder.decode(this).toString();
  }

}

_defineProperty(VfsBuffer, "name", "VfsBuffer");
// EXTERNAL MODULE: ./src/modules/path.js
var modules_path = __webpack_require__(878);
;// CONCATENATED MODULE: ./src/modules/fsEntry.js
function fsEntry_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



class VfsEntry {
  constructor(fullName, nodeType) {
    fsEntry_defineProperty(this, "fullName", "");

    fsEntry_defineProperty(this, "pathName", "");

    fsEntry_defineProperty(this, "nodeType", undefined);

    fsEntry_defineProperty(this, "birthtime", Date.now());

    fsEntry_defineProperty(this, "atime", Date.now());

    fsEntry_defineProperty(this, "ctime", Date.now());

    fsEntry_defineProperty(this, "mtime", Date.now());

    fsEntry_defineProperty(this, "contents", new VfsBuffer([]));

    fsEntry_defineProperty(this, "size", 0);

    this.fullName = fullName;
    this.pathName = modules_path.dirname(this.fullName);
    this.nodeType = nodeType;
  }

}
;// CONCATENATED MODULE: ./src/modules/localStorage.js
/**
 * Discord and BetterDiscord are purposefully hiding access to the localStorage.
 * This function serves as a workaround until StorageManager works again...
 * Taken from https://stackoverflow.com/a/53773662
 * @returns {PropertyDescriptor}
 */
function getLocalStoragePropertyDescriptor() {
  const frame = document.createElement('frame');
  document.body.appendChild(frame);
  const p = Object.getOwnPropertyDescriptor(frame.contentWindow, 'localStorage');
  frame.remove();
  return p;
}

Object.defineProperty(window, 'restoredLocalStorage', getLocalStoragePropertyDescriptor());
function getItem(key) {
  return window.restoredLocalStorage.getItem(key);
}
function setItem(key, item) {
  window.restoredLocalStorage.setItem(key, item);
}
;// CONCATENATED MODULE: ./src/modules/utilities.js
class Utilities {
  /**
   * Converts an {@link ArrayBuffer} to a base64 string.
   * @param {ArrayBuffer} buffer - The ArrayBuffer to be converted into a base64 string.
   * @returns {string} The base64 string representation of the ArrayBuffer's data.
   */
  static arrayBufferToBase64(buffer) {
    let binaryString = Array.from(buffer).map(chr => String.fromCharCode(chr)).join('');
    return btoa(binaryString);
  }
  /**
   * Converts a base64 string to an {@link ArrayBuffer}.
   * @param {string} b64String - The base64 string that is to be converted.
   * @returns {Uint8Array} An Uint8Array representation of the data contained within the b64String.
   */


  static base64ToArrayBuffer(b64String) {
    let binaryString = atob(b64String);
    let buffer = new Uint8Array(binaryString.length);
    Array.from(binaryString).forEach((chr, idx) => buffer[idx] = chr.charCodeAt(0));
    return buffer;
  }

}
// EXTERNAL MODULE: ../common/dom.js
var dom = __webpack_require__(706);
// EXTERNAL MODULE: ../common/logger.js
var logger = __webpack_require__(602);
;// CONCATENATED MODULE: ./src/modules/fs.js







 // IndexedDB constants

const DB_NAME = "BdBrowser";
const DB_VERSION = 1;
const DB_STORE = "vfs";
const DB_DURABILITY = "relaxed"; // Possible values: default, relaxed, strict

const DB_FORCE_COMMIT = false;
/**
 * Name of the LocalStorage key that holds BdBrowser's virtual filesystem.
 * @type {string}
 */

const BD_FILES_KEY = "bd-files";
/**
 * Name of the LocalStorage key to check whether a migration from the LocalStorage
 * virtual filesystem is required/has been performed or not.
 * @type {string}
 * @see setBdBrowserFilesMigrated
 */

const BD_FILES_MIGRATED_KEY = "bd-files-migrated";
/**
 * Name of the LocalStorage key that holds BdBrowser's VFS version.
 * @type {string}
 */

const BD_VFS_VERSION_KEY = "bd-vfs-version";
/**
 * BdBrowser Virtual Filesystem version.
 * Increase this value when making (breaking) changes to the VFS.
 * @type {number}
 */

const BD_VFS_VERSION = 2;
/**
 * List of virtual folders to initialize on a fresh installation.
 * @type {string[]}
 */

const VFS_FOLDERS_TO_INITIALIZE = ["AppData", "AppData/BetterDiscord", "AppData/BetterDiscord/plugins", "AppData/BetterDiscord/themes", "AppData/BetterDiscord/data"];
const FILE_REGEX = /\.(.+)$/;
const emitter = new events/* default */.Z();
/**
 * Global handle of the IndexedDB database connection.
 */

let database;
/**
 * Global handle of the memory cache.
 * @type {{data: VfsEntry}}
 */

let cache = {
  data: {}
};
/*---------------------------------------------------------------------------*/

/* Helper Functions from original fs.js                                      */

/*---------------------------------------------------------------------------*/

/**
 * Returns the last portion of a path, similar to the Unix basename command.
 * Deprecated, use {@link path.basename} instead if you have an already normalized path!
 * @param {string} path - Path to break and parse.
 * @returns {string} Last portion of the given input path.
 * @deprecated
 */

function basename(path) {
  if (typeof path !== "string") {
    throw Object.assign(new TypeError(`The "path" argument must be of type string. Received ${typeof path}.`), {
      code: "ERR_INVALID_ARG_TYPE"
    });
  }

  return path.split(/\/|\\/).pop();
}
/**
 * Checks whether a given input filename is considered a file or not.
 * @param {string} name - Filename to check.
 * @returns {boolean} Result of evaluation.
 */

function isFile(name) {
  return FILE_REGEX.test(name);
}
/**
 * Normalizes a given input path by converting backslashes to slashes
 * and removing leading/trailing slashes.
 * @param {string} path - Path to normalize.
 * @returns {string} Normalized path or empty string if no path was supplied.
 */


function normalizePath(path) {
  if (!path) return "";
  let normalizedPath = path;
  normalizedPath = normalizedPath.replace(/\\/g, "/"); // Convert backslashes to slashes

  normalizedPath = normalizedPath.replace(/^\/|\/$/g, ""); // Remove slashes in front/back

  return normalizedPath;
}
/*---------------------------------------------------------------------------*/

/* General VFS Functions                                                     */

/*---------------------------------------------------------------------------*/

/**
 * Exports the current contents of the virtual file system as a serialized JSON file.
 * @see importVfsBackup
 */

function exportVfsBackup() {
  let vfsList = {};
  let execDate = new Date().toISOString().replace(":", "-").replace(".", "-");

  for (const fullName of Object.keys(cache.data)) {
    // Must be a deep copy, otherwise the source object will take damage!
    let o = Object.assign(new VfsEntry(fullName, cache.data[fullName].nodeType), cache.data[fullName]); // Directories do not have contents.

    if (o.contents) o.contents = Utilities.arrayBufferToBase64(o.contents);
    vfsList[fullName] = o;
  }

  let jsonString = JSON.stringify(vfsList);
  let a = dom/* default.createElement */.Z.createElement("a");
  a.href = window.URL.createObjectURL(new Blob([jsonString], {
    type: "application/json"
  }));
  a.download = `bdbrowser_backup_${execDate}.json`;
  a.click();
  a.remove();
}
/**
 * "Formats" the virtual file system and re-initializes it with the base directory structure.
 * @param {boolean} userIsSure Signals that the user is sure they want to format the virtual file system.
 */


function formatVfs(userIsSure) {
  if (userIsSure === true) {
    logger/* default.log */.Z.log("VFS", "Formatting VFS and initializing base data...");

    for (const fullName of Object.keys(cache.data)) {
      removeFromVfsCache(fullName);
      removeIndexedDbKey(fullName);
    }

    initializeBaseData();
  } else {
    logger/* default.info */.Z.info("VFS", "If you are sure you want to format the VFS, please call the function like this: fs.formatVfs(true);");
  }
}
/**
 * Imports a serialized JSON backup of the virtual file system.
 * Existing files that are not present in the backup will be kept in place.
 * @see exportVfsBackup
 */


function importVfsBackup() {
  let i = dom/* default.createElement */.Z.createElement("input", {
    type: "file"
  });
  i.addEventListener("change", () => {
    for (const file of i.files) {
      const reader = new FileReader();

      reader.onload = () => {
        logger/* default.log */.Z.log("VFS", "Import from backup.");
        let backupData = JSON.parse(reader.result);

        for (const fullName of Object.keys(backupData)) {
          let o = Object.assign(new VfsEntry(fullName, backupData[fullName].nodeType), backupData[fullName]); // Skip directories, they have no payload!

          if (o.contents) o.contents = Utilities.base64ToArrayBuffer(o.contents);
          logger/* default.log */.Z.log("VFS", `Restoring from backup: ${o.fullName}`);
          writeOrUpdateMemoryCache(o.fullName, o);
          writeOrUpdateIndexedDbKey(o.fullName, o);
        }

        logger/* default.log */.Z.log("VFS", "Import finished.");
      };

      reader.readAsText(file);
    }
  });
  i.click();
  i.remove();
}
/**
 * Returns the version of BdBrowser's VFS according to the LocalStorage.
 * @see setBdBrowserVfsVersion
 * @returns {number|undefined} VFS version according to LocalStorage key.
 */


function getBdBrowserVfsVersion() {
  return getItem(BD_VFS_VERSION_KEY) || 0;
}
/**
 * Returns the accumulated size of all files in the VFS.
 * @returns {number} - Size of all files in bytes.
 */


function getVfsSizeInBytes() {
  let totalSize = 0;
  let fileSizes = [];

  for (const key of Object.keys(cache.data)) {
    if (cache.data[key].nodeType === "file") {
      totalSize += cache.data[key].size;
      fileSizes.push({
        fullName: key,
        size: cache.data[key].size
      });
    }
  }

  fileSizes.sort((l, r) => l.size < r.size ? 1 : -1);
  console.log(fileSizes);
  return totalSize;
}
/**
 * Checks whether the LocalStorage contains the key carrying the virtual filesystem.
 * @returns {boolean}
 */


function hasBdBrowserFiles() {
  let bdFilesItem = getItem(BD_FILES_KEY);
  return bdFilesItem !== undefined;
}
/**
 * Checks whether the LocalStorage key for the migration is present and set to `true`.
 * @returns {boolean}
 */


function hasBeenMigrated() {
  let wasMigrated = getItem(BD_FILES_MIGRATED_KEY);
  return wasMigrated === "true";
}
/**
 * This function starts the migration of an existing BdBrowser virtual filesystem
 * from the LocalStorage into the new IndexedDB backend. Calls
 * {@link importLocalStorageNode} to do all the heavy lifting.
 * @see importLocalStorageNode
 * @returns {Promise<boolean>} - Migration successful
 */


function importFromLocalStorage() {
  return new Promise(resolvePromise => {
    // Make sure we start on an empty stomach.
    // Note: This only clears the MEMORY cache, the database is specifically
    // _not_ being emptied. Import overwrites conflicting entries in the database
    // but leaves existing ones that are not part of the LocalStorage alone.
    emptyVfsCache();
    let localStorageData = getItem(BD_FILES_KEY);

    if (!localStorageData) {
      setBdBrowserVfsVersion(BD_VFS_VERSION);
      resolvePromise(false);
      return;
    }

    logger/* default.log */.Z.log("VFS", "Migrating existing data from Local Storage into IndexedDB...");
    let startTime = performance.now();
    let localStorageJson = Object.assign({}, JSON.parse(localStorageData)); // Skip the root node; directly start in "files" so there are keys to evaluate!

    importLocalStorageNode(localStorageJson.files);
    setBdBrowserVfsVersion(BD_VFS_VERSION);
    setBdBrowserFilesMigrated();
    let endTime = performance.now();
    logger/* default.log */.Z.log("VFS", `Migration of existing data complete, took ${(endTime - startTime).toFixed(2)}ms.`);
    resolvePromise(true);
  });
}
/**
 * Recursively imports files and folders from a BdBrowser LocalStorage JSON object
 * into the IndexedDB database by pushing them into the memory cache.
 * @see importFromLocalStorage
 * @param {object[]} vfsObject - Array of objects representing files or folders.
 * @param {string} parentPath - Absolute path of the parent that called this function.
 */


function importLocalStorageNode(vfsObject, parentPath = "") {
  for (let vfsObjectKey in vfsObject) {
    if (!vfsObject[vfsObjectKey].type) continue;

    switch (vfsObject[vfsObjectKey].type) {
      case "file":
        let fileName = normalizePath(parentPath.concat("/", vfsObjectKey));
        writeFileSync(fileName, vfsObject[vfsObjectKey].content);
        break;

      case "dir":
        let folderName = normalizePath(parentPath.concat("/", vfsObjectKey));
        mkdirSync(folderName); // Recursively process all child folders, dive straight into "files"!

        importLocalStorageNode(vfsObject[vfsObjectKey].files, folderName);
        break;
    }
  }
}
/**
 * Creates the base directories for a fresh VFS and sets the migrated flag.
 * @see VFS_FOLDERS_TO_INITIALIZE
 * @see setBdBrowserFilesMigrated
 * @return {Promise<boolean>} - Value indicating that base data was initialized.
 */


function initializeBaseData() {
  return new Promise(resolvePromise => {
    logger/* default.log */.Z.log("VFS", "Creating base VFS for fresh installation.");
    emptyVfsCache();
    VFS_FOLDERS_TO_INITIALIZE.forEach(folder => mkdirSync(folder));
    setBdBrowserVfsVersion(BD_VFS_VERSION);
    setBdBrowserFilesMigrated();
    logger/* default.log */.Z.log("VFS", "Base VFS structure created!");
    resolvePromise(true);
  });
}
/**
 * Initializes the VFS after the database connection is established.
 * This function automatically determines whether existing data should be
 * migrated from the LocalStorage virtual filesystem or a regular VFS
 * memory cache fill is in order.
 * @returns {Promise<boolean>} - Boolean indicating whether operation was successful.
 */


function initializeVfs() {
  return new Promise(resolvePromise => {
    if (!hasBeenMigrated()) {
      if (hasBdBrowserFiles()) resolvePromise(importFromLocalStorage());else resolvePromise(initializeBaseData());
    } else resolvePromise(fillMemoryCacheFromIndexedDb());
  });
}
/**
 * Sets the LocalStorage migration key to either `true` or the specified value.
 * @param {boolean} value - Boolean to set the value of the key to.
 * @see BD_FILES_MIGRATED_KEY
 */

function setBdBrowserFilesMigrated(value = true) {
  setItem(BD_FILES_MIGRATED_KEY, value);
}
/**
 * Sets the LocalStorage VFS version key.
 * @see BD_VFS_VERSION
 * @param {number} version - New version of the VFS.
 */


function setBdBrowserVfsVersion(version) {
  setItem(BD_VFS_VERSION_KEY, version);
}
/**
 * Internal maintenance function to service VFS objects and perform updates.
 * Called during {@link initializeVfs} if {@link BD_VFS_VERSION} is greater
 * than the return value of {@link getBdBrowserVfsVersion}.
 */


function upgradeVfsData() {
  const textEncoder = new TextEncoder();
  const propertiesToRemove = ["mimeType", // 2022-09-04, Will be determined dynamically if needed.
  "fileName" // 2022-09-04, Derived from path.basename(fullName) now.
  ];
  logger/* default.log */.Z.log("VFS", "Running VFS maintenance...");

  for (const [key, value] of Object.entries(cache.data)) {
    let vfsObject = new VfsEntry(value.fullName, value.nodeType);
    let hasChanged = false;
    vfsObject = Object.assign(vfsObject, value); // --------------------------------------------------------------------
    // Remove obsolete metadata entries to keep things orderly            |
    // --------------------------------------------------------------------

    if (Object.getOwnPropertyNames(vfsObject).some(e => propertiesToRemove.includes(e))) {
      console.log(`❌ Removing obsolete VFS metadata for: ${vfsObject.fullName}.`);
      propertiesToRemove.forEach(prop => {
        if (vfsObject.hasOwnProperty(prop)) {
          console.log(`  Removing property "${prop}".`);
          delete vfsObject[prop];
          hasChanged = true;
        }
      });
    } // --------------------------------------------------------------------
    // Migrate between string and UInt8Array for content storage          |
    // --------------------------------------------------------------------


    if (vfsObject.nodeType === "file" && vfsObject.contents.constructor.name === "String") {
      console.log(`♻ Converting "contents" from String to Uint8Array for: ${vfsObject.fullName}.`);
      vfsObject.contents = textEncoder.encode(vfsObject.contents);
      vfsObject.size = vfsObject.contents.byteLength;
      hasChanged = true;
    } // --------------------------------------------------------------------
    // Finished processing single VFS entry                               |
    // --------------------------------------------------------------------


    if (hasChanged) {
      console.log("✅ Committing entry to data store.");
      writeOrUpdateMemoryCache(key, vfsObject);
      writeOrUpdateIndexedDbKey(key, vfsObject);
    }
  }

  setBdBrowserVfsVersion(BD_VFS_VERSION);
  logger/* default.log */.Z.log("VFS", "Maintenance complete.");
  logger/* default.log */.Z.log("VFS", `VFS is now at version ${BD_VFS_VERSION}.`);
}
/*---------------------------------------------------------------------------*/

/* Local Memory Cache Functions                                              */

/*---------------------------------------------------------------------------*/
// noinspection JSUnusedLocalSymbols

/**
 * Dumps the contents of the memory cache into the console for easier
 * debugging.
 * @returns {{data: VfsEntry[]}}
 */


function dumpVfsCache() {
  return cache.data;
}
/**
 * Clears/empties the internal memory cache without replicating the changes
 * to the database.
 * Should only be used by the bootstrapping and migration functions.
 */

function emptyVfsCache() {
  cache.data = [];
}
/**
 * Returns either an {@link object} from the internal memory cache
 * or the value of the given prop parameter.
 * @see removeFromVfsCache
 * @param {string} path - Key of the VFS entry to query.
 * @param {string} [prop] - Optional name of property.
 * @returns {undefined|VfsEntry|*}
 */


function getVfsCacheEntry(path, prop) {
  if (cache.data[path]) {
    // No property defined, return entire object.
    if (!prop) return cache.data[path];
    if (cache.data[path].hasOwnProperty(prop)) return cache.data[path][prop];
  }
}
/**
 * Removes an entry from the internal memory cache without replicating the
 * change to the database.
 * @see getVfsCacheEntry
 * @see writeOrUpdateMemoryCache
 * @param {string} path - Key of the VFS entry to remove
 */


function removeFromVfsCache(path) {
  path = normalizePath(path);
  if (cache.data[path]) delete cache.data[path];
}
/**
 * Writes/updates the internal memory cache without replicating the change
 * to the database. _If_ you have to meddle with the cache,
 * please use this function.
 * @see writeInternalVfsCacheEntry
 * @see removeFromVfsCache
 * @param {string} path - Key of the VFS entry to update
 * @param {VfsEntry} vfsEntryObject - New values for the VFS entry. Replaces the old object.
 */


function writeOrUpdateMemoryCache(path, vfsEntryObject) {
  path = normalizePath(path);
  cache.data[path] = vfsEntryObject;
}
/**
 * Simple implementation of an inotify function to dispatch events about
 * changes in the filesystem to subscribed listeners.
 * Recursively works its way up the root directory from the original emitter.
 * @see watch
 * @param {string} path - Absolute path of a file/directory to dispatch an event for.
 * @param {string} event - The event to dispatch (i.e. "change" or "rename").
 * @param {string} [source] - Used on recursive calls to denote the caller.
 */


function inotify(path, event, source) {
  let parent = modules_path.dirname(path);
  let newSource = modules_path.basename(path); // Initially, the {source} parameter should not be supplied when
  // calling inotify. It is intended for recursive calls made from
  // within the function.

  if (!source) source = modules_path.basename(path); // The structure for the calls looks like this for creating a new file:
  // (Assuming we work with AppData/BetterDiscord/data/MyFile.txt)
  // 0: Path: MyFile.txt,    Source: MyFile.txt,    Event: rename
  // 1: Path: data,          Source: MyFile.txt,    Event: rename
  // 2: Path: BetterDiscord, Source: data,          Event: change (!)
  // 3: Path: AppData,       Source: BetterDiscord, Event: change (!)
  // So unless we are directly dealing with the file or its host directory,
  // we change the "rename" to a "change" to signal metadata change because
  // rename has a different use for directories (creating/deleting).

  if (!isFile(source) && modules_path.basename(path) !== source) event = "change";
  emitter.emit(path, source, event);
  if (parent.length > 0) inotify(parent, event, newSource);
}
/*---------------------------------------------------------------------------*/

/* fs Functions                                                              */

/*---------------------------------------------------------------------------*/

/**
 * Test whether the given path exists by checking with the file system.
 * Then call the callback argument with either true or false.
 * @param {string} path - Path to test.
 * @param {function} callback - Callback function to execute.
 */


function exists(path, callback) {
  let v = existsSync(path);
  callback(v);
}
function existsSync(path) {
  try {
    path = normalizePath(path);
    let stats = statSync(path);
    return stats.isFile() || stats.isDirectory();
  } catch (e) {
    return false;
  }
}
/**
 * Returns a new {@link Error} object for a known list of filesystem error codes.
 * @param {object} params - Object containing the parameters for the error message.
 * @returns {(Error & {syscall: string, path: string, errno: number, code: string})|any}
 */

function getVfsErrorObject(params) {
  let errno = undefined;
  let msg = undefined;
  let code = undefined;
  let path = params.dest ? `'${params.path}' -> '${params.dest}'` : `'${params.path}'`;

  switch (params.error) {
    case "EACCES":
      code = "EACCES";
      errno = -13;
      msg = `${code}: permission denied, ${params.syscall} ${path}`;
      break;

    case "EEXIST":
      code = "EEXIST";
      errno = -4075;
      msg = `${code}: file already exists, ${params.syscall} ${path}`;
      break;

    case "EISDIR":
      code = "EISDIR";
      errno = -4068;
      msg = `${code}: illegal operation on a directory, ${params.syscall} ${path}`;
      break;

    case "ENOENT":
      code = "ENOENT";
      errno = -4058;
      msg = `${code}: no such file or directory, ${params.syscall} ${path}`;
      break;

    case "ENOTDIR":
      code = "ENOTDIR";
      errno = -4052;
      msg = `${code}: not a directory, ${params.syscall} ${path}`;
      break;

    case "ENOTEMPTY":
      code = "ENOTEMPTY";
      errno = -4051;
      msg = `${code}: directory not empty, ${params.syscall} ${path}`;
      break;

    case "EPERM":
      code = "EPERM";
      errno = -4048;
      msg = `${code}: operation not permitted, ${params.syscall} ${path}`;
      break;

    default:
      return Object.assign(new Error(`Unknown getVfsErrorObject error provided: ${params.error}, ${params.syscall}`));
  }

  return Object.assign(new Error(msg), {
    errno: errno,
    syscall: params.syscall,
    code: code,
    path: params.path,
    dest: params.dest
  });
}

function statSync(path) {
  path = normalizePath(path);
  let fsEntry = getVfsCacheEntry(path);
  if ((fsEntry === null || fsEntry === void 0 ? void 0 : fsEntry.nodeType) !== "file" && (fsEntry === null || fsEntry === void 0 ? void 0 : fsEntry.nodeType) !== "dir") throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "stat"
  });
  return {
    birthtime: new Date(fsEntry.birthtime),
    atime: new Date(fsEntry.atime),
    ctime: new Date(fsEntry.ctime),
    mtime: new Date(fsEntry.mtime),
    birthtimeMs: fsEntry.birthtime,
    atimeMs: fsEntry.atime,
    ctimeMs: fsEntry.ctime,
    mtimeMs: fsEntry.mtime,
    size: fsEntry.size,
    uid: 1001,
    gid: 1001,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isDirectory: () => fsEntry.nodeType === "dir",
    isFIFO: () => false,
    isFile: () => fsEntry.nodeType === "file",
    isSocket: () => false,
    isSymbolicLink: () => false
  };
}
function mkdir(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  try {
    let v = mkdirSync(path, options);
    callback(v);
  } catch {
    callback();
  }
}
function mkdirSync(path, options) {
  path = normalizePath(path);
  let parentPath = modules_path.dirname(path);
  let firstPathElementCreated;
  if (!options) options = {
    recursive: false
  };
  if (existsSync(path)) throw getVfsErrorObject({
    path: path,
    error: "EEXIST",
    syscall: "mkdir"
  });

  if (options.recursive === true) {
    let pathElements = path.split("/");
    let pathCrumb = ""; // Remove last item, will be created by the regular (non-recursive) logic.

    pathElements.pop();
    pathElements.forEach(element => {
      pathCrumb = normalizePath(pathCrumb.concat("/", element));

      try {
        mkdirSync(pathCrumb, {
          recursive: false
        }); // If mkdirSync was successful and this is the first element
        // this loop was able to create, remember it for later return.

        if (!firstPathElementCreated) firstPathElementCreated = pathCrumb;
      } catch (e) {// Ignore exceptions here, they are likely EEXIST errors.
      }
    });
  } // Parent directory needs to exist, unless it is the root.


  if (parentPath.length > 0 && !existsSync(parentPath)) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "mkdir"
  }); // Uniform Date.now() for all fs timestamps

  let dateNow = Date.now();
  let objDir = Object.assign(new VfsEntry(path, "dir"), {
    /* Node Information */
    birthtime: dateNow,
    atime: dateNow,
    ctime: dateNow,
    mtime: dateNow,

    /* Content Information */
    contents: undefined,
    size: 0
  });
  writeOrUpdateMemoryCache(path, objDir);
  writeOrUpdateIndexedDbKey(path, objDir);
  inotify(path, "rename");
  if (options.recursive === true) return firstPathElementCreated || path;
}
function readdirSync(path) {
  path = normalizePath(path);
  let found = []; // Check if element exists at all

  if (!existsSync(path)) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "scandir"
  }); // Check if element is a directory

  let stat = statSync(path);
  if (!stat.isDirectory()) throw getVfsErrorObject({
    path: path,
    error: "ENOTDIR",
    syscall: "scandir"
  }); // Find other elements that reside within this element.

  for (let dataKey in cache.data) {
    let fsEntry = getVfsCacheEntry(dataKey);

    if (fsEntry.pathName === path) {
      found.push(modules_path.basename(fsEntry.fullName));
    }
  }

  return found.sort();
}
function readFile(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  try {
    let data = readFileSync(path, options);
    callback(undefined, data);
  } catch (e) {
    callback(e, undefined);
  }
}
function readFileSync(path, options) {
  path = normalizePath(path);
  if (!options) options = {
    encoding: null
  };else if (typeof options === "string") options = {
    encoding: options
  };
  let fsEntry = getVfsCacheEntry(path);
  if (!fsEntry) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "open"
  });

  if (options.encoding) {
    let textDecoder = new TextDecoder(options.encoding); // Call toString() - otherwise it is a DOMString!

    return textDecoder.decode(fsEntry.contents).toString();
  } else {
    // Always return a VfsBuffer, so .toString() works as expected.
    return new VfsBuffer(fsEntry.contents);
  }
}
/**
 * Internal function that removes a node (file or directory) from the VFS.
 * Used by {@link unlinkSync}, {@link rmSync} and {@link rmdirSync}.
 * @param {string} path - Path to remove
 * @param {object} [options] - Options for removal
 * @returns {undefined}
 */

function removeFileOrDirectory(path, options) {
  path = normalizePath(path);
  if (!options) options = {
    recursive: false,
    force: false
  }; // The very last fail-safe.

  if (!existsSync(path)) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "rm"
  });
  let stat = statSync(path);

  if (stat.isFile()) {
    removeFromVfsCache(path);
    removeIndexedDbKey(path);
    inotify(path, "rename");
  } else {
    if (options.recursive === true) {
      for (let vfsObject in cache.data) {
        let vfsEntry = getVfsCacheEntry(vfsObject);

        if (vfsEntry.pathName.startsWith(path)) {
          removeFileOrDirectory(vfsEntry.fullName, {
            recursive: options.recursive,
            force: options.force
          });
        }
      }
    }

    removeFromVfsCache(path);
    removeIndexedDbKey(path);
    inotify(path, "rename");
  }
}

function rm(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  try {
    rmSync(path, options);
    callback();
  } catch (e) {
    callback(e);
  }
}
function rmSync(path, options) {
  path = normalizePath(path);
  if (!options) options = {
    recursive: false,
    force: false
  };

  try {
    if (!existsSync(path)) {
      // noinspection ExceptionCaughtLocallyJS
      throw getVfsErrorObject({
        path: path,
        error: "ENOENT",
        syscall: "rm"
      });
    }

    let stat = statSync(path);

    if (stat.isDirectory() && options.recursive !== true && readdirSync(path).length > 0) {
      // noinspection ExceptionCaughtLocallyJS
      throw getVfsErrorObject({
        path: path,
        error: "ENOTEMPTY",
        syscall: "rm"
      });
    }

    removeFileOrDirectory(path, {
      recursive: options.recursive,
      force: options.force
    });
  } catch (e) {
    if (options.force !== true) throw e;
  }
}
function rmdir(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  try {
    rmdirSync(path, options);
    callback();
  } catch (e) {
    callback(e);
  }
}
function rmdirSync(path, options) {
  path = normalizePath(path);
  if (!options) options = {
    recursive: false
  };
  if (!existsSync(path) || !statSync(path).isDirectory()) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "rmdir"
  });
  if (options.recursive !== true && readdirSync(path).length > 0) throw getVfsErrorObject({
    path: path,
    error: "ENOTEMPTY",
    syscall: "rmdir"
  });
  removeFileOrDirectory(path, {
    recursive: options.recursive,
    force: false
  });
}
/**
 * Asynchronously removes a file or symbolic link. No arguments other than a
 * possible exception are given to the completion callback.
 * @see unlinkSync
 * @param {string} path - Path to the file to remove.
 * @param {function} callback - Callback function.
 */

function unlink(path, callback) {
  try {
    unlinkSync(path);
    callback();
  } catch (e) {
    callback(e);
  }
}
/**
 * Synchronous unlink.
 * @see unlink
 * @param {string} path - Path to the file to remove.
 */

function unlinkSync(path) {
  path = normalizePath(path);
  if (!existsSync(path)) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "unlink"
  });
  if (!statSync(path).isFile()) throw getVfsErrorObject({
    path: path,
    error: "EPERM",
    syscall: "unlink"
  });
  removeFileOrDirectory(path, {
    recursive: false,
    force: false
  });
}
function watch(path, options, listener) {
  if (typeof options === "function") {
    listener = options;
    options = {};
  }

  const callback = (path, type) => {
    listener(type, path);
  };

  emitter.on(path, callback);
  return {
    close: () => emitter.off(path, callback)
  };
}
function writeFile(path, content, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  try {
    writeFileSync(path, content);
    callback();
  } catch (e) {
    callback(e);
  }
}
function writeFileSync(path, content, options) {
  path = normalizePath(path);
  let filename = modules_path.basename(path);
  let encodedContent = new VfsBuffer([]); // TODO: No idea how that would work right now...

  if (!options) options = {
    encoding: "utf-8"
  };else if (typeof options === "string") options = {
    encoding: options
  };
  if (existsSync(path) && statSync(path).isDirectory()) throw getVfsErrorObject({
    path: path,
    error: "EISDIR",
    syscall: "open"
  }); // TODO: Not a clean solution.

  if (!isFile(filename)) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "open"
  });
  if (!existsSync(modules_path.dirname(path))) throw getVfsErrorObject({
    path: path,
    error: "ENOENT",
    syscall: "open"
  }); // In case the file already exists, some metadata can be pulled for re-use.

  let currentBirthtime = getVfsCacheEntry(path, "birthtime"); // Uniform Date.now() for all fs timestamps

  let dateNow = Date.now();
  if (typeof content === "string") encodedContent = new TextEncoder().encode(content);else encodedContent = content;
  let objFile = Object.assign(new VfsEntry(path, "file"), {
    /* Node Information */
    birthtime: currentBirthtime ? currentBirthtime : dateNow,
    atime: dateNow,
    ctime: dateNow,
    mtime: dateNow,

    /* Content Information */
    contents: encodedContent,
    size: encodedContent.byteLength
  });
  writeOrUpdateMemoryCache(path, objFile);
  writeOrUpdateIndexedDbKey(path, objFile);
  inotify(path, "change");
}
/*---------------------------------------------------------------------------*/

/* IndexedDB Functions                                                       */

/*---------------------------------------------------------------------------*/

/**
 * Returns an object store for the BdBrowser VFS store with the requested
 * transaction mode.
 * @param {string} [mode="readwrite"] - Transaction mode
 * @returns {IDBObjectStore} - Object store
 */

function getObjectStore(mode = "readwrite") {
  let txOptions = {
    durability: DB_DURABILITY
  };
  let transaction = database.transaction(DB_STORE, mode, txOptions);

  transaction.onabort = function () {
    logger/* default.error */.Z.error("VFS", "Transaction aborted:", transaction.error);
  };

  transaction.oncomplete = function () {};

  transaction.onerror = function () {
    logger/* default.error */.Z.error("VFS", "Transaction error:", transaction.error);
  };

  return transaction.objectStore(DB_STORE);
}
/**
 * Ensures an IndexedDB database connection is present.
 * Will perform the required creation/upgrade of the schema.
 * Promise is only resolved on success in order to block execution flow.
 * @returns {Promise<boolean>} - Value indicating whether database connection is alive.
 */


function openDatabase() {
  return new Promise((resolvePromise, rejectPromise) => {
    let request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = function (event) {
      logger/* default.log */.Z.log("VFS", "Database connection established.");
      database = event.target.result;
      resolvePromise(true);
    };

    request.onclose = function () {
      logger/* default.log */.Z.log("VFS", "Database connection closed.");
      database = undefined;
    };

    request.onerror = function (e) {
      logger/* default.error */.Z.error("VFS", "Could not establish database connection:", request.error);
      rejectPromise(e);
    };

    request.onversionchange = function () {
      logger/* default.log */.Z.log("VFS", "Database version changed.");
    };

    request.onupgradeneeded = function (event) {
      event.currentTarget.result.createObjectStore(DB_STORE, {
        keyPath: "fullName"
      });
      logger/* default.log */.Z.log("VFS", "Database upgrade performed.");
    };
  });
}
/**
 * Performs the initial flood fill of the memory cache with data from
 * the IndexedDB.
 * @return {Promise<boolean>} - Value indicating that cache was filled.
 */


function fillMemoryCacheFromIndexedDb() {
  return new Promise((resolvePromise, rejectPromise) => {
    if (!database) throw new Error("Database not connected!");
    logger/* default.log */.Z.log("VFS", "Pre-caching data from IndexedDB...");
    let startTime = performance.now();
    let store = getObjectStore("readonly");
    let vfsEntries = store.getAll();

    vfsEntries.onsuccess = function (event) {
      let cursor = event.target.result;
      cursor.forEach(entry => {
        cache.data[entry.fullName] = Object.assign(new VfsEntry(entry.fullName, entry.nodeType), entry);
      }); // Once the cache has been populated, run required maintenance
      // work on the system. Has to happen before any logic uses
      // readFileSync() or writeFileSync() because they might fail.

      if (getBdBrowserVfsVersion() < BD_VFS_VERSION) upgradeVfsData();
      let endTime = performance.now();
      logger/* default.log */.Z.log("VFS", `Memory cache populated, took ${(endTime - startTime).toFixed(2)}ms. VFS is ready.`);
      resolvePromise(true);
    };

    vfsEntries.onerror = function (e) {
      logger/* default.error */.Z.error("VFS", "Error during fillMemoryCacheFromIndexedDb:", vfsEntries.error);
      rejectPromise(e);
    };
  });
}
/**
 * Removes a given fullName key in the IndexedDB.
 * @param {string} fullNameKey - fullName key of the object to remove.
 */


function removeIndexedDbKey(fullNameKey) {
  if (!database) throw new Error("Database not connected!");
  let store = getObjectStore();
  let res = store.delete(fullNameKey);

  res.onsuccess = function () {
    if (DB_FORCE_COMMIT) store.transaction.commit();
  };

  res.onerror = function () {
    logger/* default.error */.Z.error("VFS", "Error while removeIndexedDbKey:", res.error);
  };
}
/**
 * Sets or updated a given fullNameKey in the IndexedDB with the new object
 * given in the vfsEntryObject parameter.
 * @param {string} fullNameKey - fullName key of the object to update.
 * @param {VfsEntry} vfsEntryObject - Object representing a file or folder.
 */


function writeOrUpdateIndexedDbKey(fullNameKey, vfsEntryObject) {
  if (!database) throw new Error("Database not connected!");
  let store = getObjectStore();
  let res = store.put(vfsEntryObject);

  res.onsuccess = function () {
    if (DB_FORCE_COMMIT) store.transaction.commit();
  };

  res.onerror = function () {
    logger/* default.error */.Z.error("VFS", "Error while writeOrUpdateIndexedDbKey:", res.error);
  };
}

const fs = {
  /* vfs-specific */
  dumpVfsCache,
  exportVfsBackup,
  formatVfs,
  getVfsCacheEntry,
  getVfsSizeInBytes,
  importVfsBackup,
  initializeVfs,
  openDatabase,

  /* tooling */
  basename,
  normalizePath,

  /* fs */
  exists,
  existsSync,
  mkdir,
  mkdirSync,
  readFile,
  readFileSync,
  readdirSync,
  realpathSync: normalizePath,
  rm,
  rmSync,
  rmdir,
  rmdirSync,
  statSync,
  unlink,
  unlinkSync,
  watch,
  writeFile,
  writeFileSync
};
/* harmony default export */ const modules_fs = (fs);

/***/ }),

/***/ 183:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "request": () => (/* binding */ request),
/* harmony export */   "createServer": () => (/* binding */ createServer),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(551);

function request(url, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  if (typeof url === "object") {
    options = JSON.parse(JSON.stringify(url));
    options.url = undefined;
    url = url.url;
  }

  (0,_fetch__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z)(url, options).then(res => res.text()).then(data => {
    callback({
      on: (event, callback) => {
        switch (event) {
          case "data":
            return callback(data);

          case "end":
            const res = new Response(data);
            res.statusCode = res.status;
            return res;
        }
      }
    });
  });
  return {
    statusCode: 200,
    on: () => {},
    end: () => {}
  };
}
function createServer() {
  return {
    listen: () => {},
    close: () => {}
  };
}
const get = request;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  get
});

/***/ }),

/***/ 301:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(432);
/* harmony import */ var _path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(878);


const globalPaths = [];
const _extensions = {
  ".json": (module, filename) => {
    const filecontent = _fs__WEBPACK_IMPORTED_MODULE_0__/* .default.readFileSync */ .ZP.readFileSync(filename);
    module.exports = JSON.parse(filecontent);
  },
  ".js": (module, filename) => {
    console.log(module, filename);
  }
};

function _require(path, req) {
  const extension = (0,_path__WEBPACK_IMPORTED_MODULE_1__.extname)(path);
  const loader = _extensions[extension];
  if (!loader) throw new Error("Unkown File extension " + path);
  const existsFile = _fs__WEBPACK_IMPORTED_MODULE_0__/* .default.existsSync */ .ZP.existsSync(path);
  if (!path) console.log(path);
  if (!existsFile) throw new Error("Module not found!");
  if (req.cache[path]) return req.cache[path];
  const final = {
    exports: {},
    filename: path,
    _compile: content => {
      let {
        module
      } = eval(`((module, global) => {
                ${content}

                return {
                    module
                };
            })({exports: {}}, window)`);
      if (Object.keys(module.exports).length) final.exports = module.exports;
      return final.exports;
    }
  };
  loader(final, path);
  return req.cache[path] = final.exports;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  Module: {
    globalPaths,
    _extensions
  },
  _require
});

/***/ }),

/***/ 585:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "editor": () => (/* binding */ editor)
/* harmony export */ });
/* harmony import */ var common_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(706);
/* harmony import */ var common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(229);
/* harmony import */ var _discordmodules__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(828);
/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(551);





const version = "6.65.7";
const links = [`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/codemirror.min.js`, `https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/mode/css/css.js`, `https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/mode/javascript/javascript.js`, `https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/search/search.js`, `https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/search/searchcursor.js`, `https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/search/jump-to-line.js`];
const cssCodes = ["/*  Name:       material  Author:     Mattia Astorino (http://github.com/equinusocio)  Website:    https://material-theme.site/*/.cm-s-material-darker.CodeMirror {  background-color: #212121;  color: #EEFFFF;}.cm-s-material-darker .CodeMirror-gutters {  background: #212121;  color: #545454;  border: none;}.cm-s-material-darker .CodeMirror-guttermarker,.cm-s-material-darker .CodeMirror-guttermarker-subtle,.cm-s-material-darker .CodeMirror-linenumber {  color: #545454;}.cm-s-material-darker .CodeMirror-cursor {  border-left: 1px solid #FFCC00;}.cm-s-material-darker div.CodeMirror-selected {  background: rgba(97, 97, 97, 0.2);}.cm-s-material-darker.CodeMirror-focused div.CodeMirror-selected {  background: rgba(97, 97, 97, 0.2);}.cm-s-material-darker .CodeMirror-line::selection,.cm-s-material-darker .CodeMirror-line>span::selection,.cm-s-material-darker .CodeMirror-line>span>span::selection {  background: rgba(128, 203, 196, 0.2);}.cm-s-material-darker .CodeMirror-line::-moz-selection,.cm-s-material-darker .CodeMirror-line>span::-moz-selection,.cm-s-material-darker .CodeMirror-line>span>span::-moz-selection {  background: rgba(128, 203, 196, 0.2);}.cm-s-material-darker .CodeMirror-activeline-background {  background: rgba(0, 0, 0, 0.5);}.cm-s-material-darker .cm-keyword {  color: #C792EA;}.cm-s-material-darker .cm-operator {  color: #89DDFF;}.cm-s-material-darker .cm-variable-2 {  color: #EEFFFF;}.cm-s-material-darker .cm-variable-3,.cm-s-material-darker .cm-type {  color: #f07178;}.cm-s-material-darker .cm-builtin {  color: #FFCB6B;}.cm-s-material-darker .cm-atom {  color: #F78C6C;}.cm-s-material-darker .cm-number {  color: #FF5370;}.cm-s-material-darker .cm-def {  color: #82AAFF;}.cm-s-material-darker .cm-string {  color: #C3E88D;}.cm-s-material-darker .cm-string-2 {  color: #f07178;}.cm-s-material-darker .cm-comment {  color: #545454;}.cm-s-material-darker .cm-variable {  color: #f07178;}.cm-s-material-darker .cm-tag {  color: #FF5370;}.cm-s-material-darker .cm-meta {  color: #FFCB6B;}.cm-s-material-darker .cm-attribute {  color: #C792EA;}.cm-s-material-darker .cm-property {  color: #C792EA;}.cm-s-material-darker .cm-qualifier {  color: #DECB6B;}.cm-s-material-darker .cm-variable-3,.cm-s-material-darker .cm-type {  color: #DECB6B;}.cm-s-material-darker .cm-error {  color: rgba(255, 255, 255, 1.0);  background-color: #FF5370;}.cm-s-material-darker .CodeMirror-matchingbracket {  text-decoration: underline;  color: white !important;}", "/*Copyright (C) 2011 by MarkLogic CorporationAuthor: Mike Brevoort <mike@brevoort.com>Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the \"Software\"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sellcopies of the Software, and to permit persons to whom the Software isfurnished to do so, subject to the following conditions:The above copyright notice and this permission notice shall be included inall copies or substantial portions of the Software.THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS ORIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS INTHE SOFTWARE.*/.cm-s-xq-light span.cm-keyword { line-height: 1em; font-weight: bold; color: #5A5CAD; }.cm-s-xq-light span.cm-atom { color: #6C8CD5; }.cm-s-xq-light span.cm-number { color: #164; }.cm-s-xq-light span.cm-def { text-decoration:underline; }.cm-s-xq-light span.cm-variable { color: black; }.cm-s-xq-light span.cm-variable-2 { color:black; }.cm-s-xq-light span.cm-variable-3, .cm-s-xq-light span.cm-type { color: black; }.cm-s-xq-light span.cm-property {}.cm-s-xq-light span.cm-operator {}.cm-s-xq-light span.cm-comment { color: #0080FF; font-style: italic; }.cm-s-xq-light span.cm-string { color: red; }.cm-s-xq-light span.cm-meta { color: yellow; }.cm-s-xq-light span.cm-qualifier { color: grey; }.cm-s-xq-light span.cm-builtin { color: #7EA656; }.cm-s-xq-light span.cm-bracket { color: #cc7; }.cm-s-xq-light span.cm-tag { color: #3F7F7F; }.cm-s-xq-light span.cm-attribute { color: #7F007F; }.cm-s-xq-light span.cm-error { color: #f00; }.cm-s-xq-light .CodeMirror-activeline-background { background: #e8f2ff; }.cm-s-xq-light .CodeMirror-matchingbracket { outline:1px solid grey;color:black !important;background:yellow; }"];
Promise.all(links.map((link, i) => {
  return (0,_fetch__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z)(link).then(res => res.text()).then(async code => {
    if (i > 0 && !window.CodeMirror) {
      while (!window.CodeMirror) {
        await new Promise(res => setTimeout(res, 200));
      }
    }

    eval(code);
  });
}));
(0,_fetch__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z)(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/codemirror.min.css`).then(res => res.text()).then(code => {
  _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.INJECT_CSS */ .A.INJECT_CSS, {
    css: code,
    id: "code-mirror-style"
  });
});

for (const css of cssCodes) {
  _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.INJECT_CSS */ .A.INJECT_CSS, {
    css: css,
    id: "code-mirror-theme-" + cssCodes.indexOf(css)
  });
}

const editor = {
  _active: [],
  setTheme: theme => {
    editor._active.forEach(e => e.setOption("theme", theme));
  },
  create: (element, props) => {
    const textarea = common_dom__WEBPACK_IMPORTED_MODULE_0__/* .default.createElement */ .Z.createElement("textarea", {});
    element.appendChild(textarea);
    const Editor = CodeMirror.fromTextArea(textarea, {
      mode: props.language,
      lineNumbers: props.lineNumbers,
      theme: _discordmodules__WEBPACK_IMPORTED_MODULE_3__/* .default.ThemeStore.theme */ .Z.ThemeStore.theme === "light" ? "xq-light" : "material-darker"
    });
    Editor.setValue(props.value);

    editor._active.push(Editor);

    return {
      dispose: () => {
        editor._active.splice(editor._active.indexOf(Editor), 1);
      },
      onDidChangeModelContent: callback => {
        Editor.on("change", () => callback());
        return {
          dispose: () => Editor.off("change", callback)
        };
      },
      getValue: () => Editor.getValue(),
      setValue: value => Editor.setValue(value),
      layout: () => {},
      $defaultHandler: {
        commands: {
          showSettingsMenu: {
            exec: () => {}
          }
        }
      }
    };
  }
};

/***/ }),

/***/ 580:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var common_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(706);
/* harmony import */ var common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65);
/* harmony import */ var common_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(602);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(229);





for (const method of Object.keys(console)) {
  var _console$method;

  if ((_console$method = console[method]) !== null && _console$method !== void 0 && _console$method.__sentry_original__) {
    console[method] = console[method].__sentry_original__;
  }
}

const appendMethods = ["append", "appendChild", "prepend"];
const originalInsertBefore = document.head.insertBefore;

document.head.insertBefore = function (node) {
  var _node$href;

  if (node !== null && node !== void 0 && (_node$href = node.href) !== null && _node$href !== void 0 && _node$href.includes("monaco-editor")) {
    _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.MAKE_REQUESTS */ .A.MAKE_REQUESTS, {
      url: node.href
    }, data => {
      common_dom__WEBPACK_IMPORTED_MODULE_0__/* .default.injectCSS */ .Z.injectCSS(node.id || "monaco-styles", data);
      if (typeof node.onload === "function") node.onload();
      common_logger__WEBPACK_IMPORTED_MODULE_3__/* .default.log */ .Z.log("CSP:Bypass", "Loaded monaco stylesheet.");
    });
    document.head.insertBefore = originalInsertBefore;
    return;
  }

  return originalInsertBefore.apply(this, arguments);
};

function patchMethods(node, callback) {
  for (const method of appendMethods) {
    const original = node[method];

    node[method] = function () {
      const data = {
        args: arguments,
        callOriginalMethod: () => original.apply(this, arguments)
      };
      return callback(data);
    };

    node[method].__bd_original = original;
  }

  return () => {
    for (const method of appendMethods) {
      const original = node[method].__bd_original;

      if (original) {
        node[method] = original;
      }
    }
  };
}

;
const unpatchHead = patchMethods(document.head, data => {
  var _node$src, _node$id;

  const [node] = data.args;

  if ((node === null || node === void 0 ? void 0 : node.id) === "monaco-style") {
    _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.MAKE_REQUESTS */ .A.MAKE_REQUESTS, {
      url: node.href
    }, data => {
      common_dom__WEBPACK_IMPORTED_MODULE_0__/* .default.injectCSS */ .Z.injectCSS(node.id, data);
      if (typeof node.onload === "function") node.onload();
      common_logger__WEBPACK_IMPORTED_MODULE_3__/* .default.log */ .Z.log("CSP:Bypass", "Loaded monaco stylesheet.");
    });
    return node;
  } else if ((node === null || node === void 0 ? void 0 : node.localName) === "bd-head") {
    patchMethods(node, data => {
      const [node] = data.args;

      if (node.localName === "bd-scripts") {
        patchMethods(node, data => {
          const [node] = data.args;
          _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.MAKE_REQUESTS */ .A.MAKE_REQUESTS, {
            url: node.src,
            type: "script"
          }, data => {
            eval(data);
            if (typeof node.onload === "function") node.onload();
            common_logger__WEBPACK_IMPORTED_MODULE_3__/* .default.log */ .Z.log("CSP:Bypass", `Loaded script with url ${node.src}`);
          });
        });
      } else if ((node === null || node === void 0 ? void 0 : node.localName) === "bd-themes") {
        patchMethods(node, data => {
          const [node] = data.args;
          if (node.getAttribute("data-bd-native")) return data.callOriginalMethod();
          injectTheme(node);
          if (typeof node.onload === "function") node.onload();
          common_logger__WEBPACK_IMPORTED_MODULE_3__/* .default.log */ .Z.log("CSP:Bypass", `Loaded theme ${node.id}`);
        });
      }

      data.callOriginalMethod();
    });
  } else if (node !== null && node !== void 0 && (_node$src = node.src) !== null && _node$src !== void 0 && _node$src.includes("monaco-editor")) {
    _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.MAKE_REQUESTS */ .A.MAKE_REQUESTS, {
      url: node.src,
      type: "script"
    }, data => {
      eval(data);
      if (typeof node.onload === "function") node.onload();
      common_logger__WEBPACK_IMPORTED_MODULE_3__/* .default.log */ .Z.log("CSP:Bypass", `Loaded script with url ${node.src}`);
    });
    return;
  } else if (node !== null && node !== void 0 && (_node$id = node.id) !== null && _node$id !== void 0 && _node$id.endsWith("-script-container")) {
    common_logger__WEBPACK_IMPORTED_MODULE_3__/* .default.log */ .Z.log("CSP:Bypass", `Loading plugin ${node.id.replace("-script-container", "")}`);
    eval(`(() => {
            try {
                ${node.textContent}
            } catch (e) {
                console.error("Failed to load plugin:", e);
            }
        })()`);
    return;
  }

  return data.callOriginalMethod();
});

function injectTheme(node) {
  _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.INJECT_THEME */ .A.INJECT_THEME, {
    id: node.id,
    css: node.textContent
  });
}

/***/ }),

/***/ 878:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "join": () => (/* binding */ join),
/* harmony export */   "basename": () => (/* binding */ basename),
/* harmony export */   "resolve": () => (/* binding */ resolve),
/* harmony export */   "extname": () => (/* binding */ extname),
/* harmony export */   "dirname": () => (/* binding */ dirname),
/* harmony export */   "isAbsolute": () => (/* binding */ isAbsolute)
/* harmony export */ });
/* harmony import */ var _fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(432);

function join(...paths) {
  let final = "";

  for (let path of paths) {
    if (!path) continue;
    path = (0,_fs__WEBPACK_IMPORTED_MODULE_0__/* .normalizePath */ .AH)(path);
    if (path[0] === "/") path = path.slice(1);
    final += path[path.length - 1] === "/" ? path : path + "/";
  }

  return final[final.length - 1] === "/" ? final.slice(0, final.length - 1) : final;
}
function basename(filename) {
  var _filename$split;

  if (typeof filename !== "string") {
    throw Object.assign(new TypeError(`The "filename" argument must be of type string. Received ${typeof filename}.`), {
      code: "ERR_INVALID_ARG_TYPE"
    });
  }

  return filename === null || filename === void 0 ? void 0 : (_filename$split = filename.split("/")) === null || _filename$split === void 0 ? void 0 : _filename$split.slice(-1)[0];
}
function resolve(...paths) {
  return join(...paths);
}
function extname(path) {
  var _path$split;

  let ext = path === null || path === void 0 ? void 0 : (_path$split = path.split(".")) === null || _path$split === void 0 ? void 0 : _path$split.slice(-1)[0];
  if (ext) ext = ".".concat(ext);
  return ext;
}
function dirname(path) {
  var _path$split2, _path$split2$slice;

  return path === null || path === void 0 ? void 0 : (_path$split2 = path.split("/")) === null || _path$split2 === void 0 ? void 0 : (_path$split2$slice = _path$split2.slice(0, -1)) === null || _path$split2$slice === void 0 ? void 0 : _path$split2$slice.join("/");
}
function isAbsolute(path) {
  var _path;

  path = (0,_fs__WEBPACK_IMPORTED_MODULE_0__/* .normalizePath */ .AH)(path);
  return (_path = path) === null || _path === void 0 ? void 0 : _path.startsWith("AppData/");
}

/***/ }),

/***/ 323:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  platform: "win32",
  env: {
    APPDATA: "AppData",
    DISCORD_APP_PATH: "AppData/Discord/AppPath",
    DISCORD_USER_DATA: "AppData/Discord/UserData",
    BETTERDISCORD_DATA_PATH: "AppData/BetterDiscord"
  }
});

/***/ }),

/***/ 164:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ require_require)
});

// NAMESPACE OBJECT: ./src/modules/vm.js
var vm_namespaceObject = {};
__webpack_require__.r(vm_namespaceObject);
__webpack_require__.d(vm_namespaceObject, {
  "compileFunction": () => (compileFunction)
});

// EXTERNAL MODULE: ./src/modules/electron.js + 1 modules
var electron = __webpack_require__(8);
// EXTERNAL MODULE: ./src/modules/https.js
var https = __webpack_require__(183);
// EXTERNAL MODULE: ./src/modules/path.js
var modules_path = __webpack_require__(878);
;// CONCATENATED MODULE: ./src/modules/vm.js
function compileFunction(code, args = []) {
  return `((${args.join(", ")}) => {
        try {
            ${code}
        } catch (e) {
            console.error("Could not load:", e);
        }
    })`;
}
// EXTERNAL MODULE: ./src/modules/webpack.js
var webpack = __webpack_require__(343);
// EXTERNAL MODULE: ./src/modules/fs.js + 4 modules
var fs = __webpack_require__(432);
// EXTERNAL MODULE: ./src/modules/discordmodules.js
var discordmodules = __webpack_require__(828);
// EXTERNAL MODULE: ./src/modules/events.js
var events = __webpack_require__(287);
;// CONCATENATED MODULE: ../assets/mime-db.json
const mime_db_namespaceObject = JSON.parse('{"application/1d-interleaved-parityfec":{"source":"iana"},"application/3gpdash-qoe-report+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/3gpp-ims+xml":{"source":"iana","compressible":true},"application/3gpphal+json":{"source":"iana","compressible":true},"application/3gpphalforms+json":{"source":"iana","compressible":true},"application/a2l":{"source":"iana"},"application/ace+cbor":{"source":"iana"},"application/ace+json":{"source":"iana","compressible":true},"application/activemessage":{"source":"iana"},"application/activity+json":{"source":"iana","compressible":true},"application/aif+cbor":{"source":"iana"},"application/aif+json":{"source":"iana","compressible":true},"application/alto-cdni+json":{"source":"iana","compressible":true},"application/alto-cdnifilter+json":{"source":"iana","compressible":true},"application/alto-costmap+json":{"source":"iana","compressible":true},"application/alto-costmapfilter+json":{"source":"iana","compressible":true},"application/alto-directory+json":{"source":"iana","compressible":true},"application/alto-endpointcost+json":{"source":"iana","compressible":true},"application/alto-endpointcostparams+json":{"source":"iana","compressible":true},"application/alto-endpointprop+json":{"source":"iana","compressible":true},"application/alto-endpointpropparams+json":{"source":"iana","compressible":true},"application/alto-error+json":{"source":"iana","compressible":true},"application/alto-networkmap+json":{"source":"iana","compressible":true},"application/alto-networkmapfilter+json":{"source":"iana","compressible":true},"application/alto-propmap+json":{"source":"iana","compressible":true},"application/alto-propmapparams+json":{"source":"iana","compressible":true},"application/alto-updatestreamcontrol+json":{"source":"iana","compressible":true},"application/alto-updatestreamparams+json":{"source":"iana","compressible":true},"application/aml":{"source":"iana"},"application/andrew-inset":{"source":"iana","extensions":["ez"]},"application/applefile":{"source":"iana"},"application/applixware":{"source":"apache","extensions":["aw"]},"application/at+jwt":{"source":"iana"},"application/atf":{"source":"iana"},"application/atfx":{"source":"iana"},"application/atom+xml":{"source":"iana","compressible":true,"extensions":["atom"]},"application/atomcat+xml":{"source":"iana","compressible":true,"extensions":["atomcat"]},"application/atomdeleted+xml":{"source":"iana","compressible":true,"extensions":["atomdeleted"]},"application/atomicmail":{"source":"iana"},"application/atomsvc+xml":{"source":"iana","compressible":true,"extensions":["atomsvc"]},"application/atsc-dwd+xml":{"source":"iana","compressible":true,"extensions":["dwd"]},"application/atsc-dynamic-event-message":{"source":"iana"},"application/atsc-held+xml":{"source":"iana","compressible":true,"extensions":["held"]},"application/atsc-rdt+json":{"source":"iana","compressible":true},"application/atsc-rsat+xml":{"source":"iana","compressible":true,"extensions":["rsat"]},"application/atxml":{"source":"iana"},"application/auth-policy+xml":{"source":"iana","compressible":true},"application/bacnet-xdd+zip":{"source":"iana","compressible":false},"application/batch-smtp":{"source":"iana"},"application/bdoc":{"compressible":false,"extensions":["bdoc"]},"application/beep+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/calendar+json":{"source":"iana","compressible":true},"application/calendar+xml":{"source":"iana","compressible":true,"extensions":["xcs"]},"application/call-completion":{"source":"iana"},"application/cals-1840":{"source":"iana"},"application/captive+json":{"source":"iana","compressible":true},"application/cbor":{"source":"iana"},"application/cbor-seq":{"source":"iana"},"application/cccex":{"source":"iana"},"application/ccmp+xml":{"source":"iana","compressible":true},"application/ccxml+xml":{"source":"iana","compressible":true,"extensions":["ccxml"]},"application/cda+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/cdfx+xml":{"source":"iana","compressible":true,"extensions":["cdfx"]},"application/cdmi-capability":{"source":"iana","extensions":["cdmia"]},"application/cdmi-container":{"source":"iana","extensions":["cdmic"]},"application/cdmi-domain":{"source":"iana","extensions":["cdmid"]},"application/cdmi-object":{"source":"iana","extensions":["cdmio"]},"application/cdmi-queue":{"source":"iana","extensions":["cdmiq"]},"application/cdni":{"source":"iana"},"application/cea":{"source":"iana"},"application/cea-2018+xml":{"source":"iana","compressible":true},"application/cellml+xml":{"source":"iana","compressible":true},"application/cfw":{"source":"iana"},"application/city+json":{"source":"iana","compressible":true},"application/clr":{"source":"iana"},"application/clue+xml":{"source":"iana","compressible":true},"application/clue_info+xml":{"source":"iana","compressible":true},"application/cms":{"source":"iana"},"application/cnrp+xml":{"source":"iana","compressible":true},"application/coap-group+json":{"source":"iana","compressible":true},"application/coap-payload":{"source":"iana"},"application/commonground":{"source":"iana"},"application/conference-info+xml":{"source":"iana","compressible":true},"application/cose":{"source":"iana"},"application/cose-key":{"source":"iana"},"application/cose-key-set":{"source":"iana"},"application/cpl+xml":{"source":"iana","compressible":true,"extensions":["cpl"]},"application/csrattrs":{"source":"iana"},"application/csta+xml":{"source":"iana","compressible":true},"application/cstadata+xml":{"source":"iana","compressible":true},"application/csvm+json":{"source":"iana","compressible":true},"application/cu-seeme":{"source":"apache","extensions":["cu"]},"application/cwl":{"source":"iana","extensions":["cwl"]},"application/cwl+json":{"source":"iana","compressible":true},"application/cwt":{"source":"iana"},"application/cybercash":{"source":"iana"},"application/dart":{"compressible":true},"application/dash+xml":{"source":"iana","compressible":true,"extensions":["mpd"]},"application/dash-patch+xml":{"source":"iana","compressible":true,"extensions":["mpp"]},"application/dashdelta":{"source":"iana"},"application/davmount+xml":{"source":"iana","compressible":true,"extensions":["davmount"]},"application/dca-rft":{"source":"iana"},"application/dcd":{"source":"iana"},"application/dec-dx":{"source":"iana"},"application/dialog-info+xml":{"source":"iana","compressible":true},"application/dicom":{"source":"iana"},"application/dicom+json":{"source":"iana","compressible":true},"application/dicom+xml":{"source":"iana","compressible":true},"application/dii":{"source":"iana"},"application/dit":{"source":"iana"},"application/dns":{"source":"iana"},"application/dns+json":{"source":"iana","compressible":true},"application/dns-message":{"source":"iana"},"application/docbook+xml":{"source":"apache","compressible":true,"extensions":["dbk"]},"application/dots+cbor":{"source":"iana"},"application/dskpp+xml":{"source":"iana","compressible":true},"application/dssc+der":{"source":"iana","extensions":["dssc"]},"application/dssc+xml":{"source":"iana","compressible":true,"extensions":["xdssc"]},"application/dvcs":{"source":"iana"},"application/ecmascript":{"source":"apache","compressible":true,"extensions":["ecma"]},"application/edi-consent":{"source":"iana"},"application/edi-x12":{"source":"iana","compressible":false},"application/edifact":{"source":"iana","compressible":false},"application/efi":{"source":"iana"},"application/elm+json":{"source":"iana","charset":"UTF-8","compressible":true},"application/elm+xml":{"source":"iana","compressible":true},"application/emergencycalldata.cap+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/emergencycalldata.comment+xml":{"source":"iana","compressible":true},"application/emergencycalldata.control+xml":{"source":"iana","compressible":true},"application/emergencycalldata.deviceinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.ecall.msd":{"source":"iana"},"application/emergencycalldata.providerinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.serviceinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.subscriberinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.veds+xml":{"source":"iana","compressible":true},"application/emma+xml":{"source":"iana","compressible":true,"extensions":["emma"]},"application/emotionml+xml":{"source":"iana","compressible":true,"extensions":["emotionml"]},"application/encaprtp":{"source":"iana"},"application/epp+xml":{"source":"iana","compressible":true},"application/epub+zip":{"source":"iana","compressible":false,"extensions":["epub"]},"application/eshop":{"source":"iana"},"application/exi":{"source":"iana","extensions":["exi"]},"application/expect-ct-report+json":{"source":"iana","compressible":true},"application/express":{"source":"iana","extensions":["exp"]},"application/fastinfoset":{"source":"iana"},"application/fastsoap":{"source":"iana"},"application/fdf":{"source":"iana","extensions":["fdf"]},"application/fdt+xml":{"source":"iana","compressible":true,"extensions":["fdt"]},"application/fhir+json":{"source":"iana","charset":"UTF-8","compressible":true},"application/fhir+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/fido.trusted-apps+json":{"compressible":true},"application/fits":{"source":"iana"},"application/flexfec":{"source":"iana"},"application/font-sfnt":{"source":"iana"},"application/font-tdpfr":{"source":"iana","extensions":["pfr"]},"application/font-woff":{"source":"iana","compressible":false},"application/framework-attributes+xml":{"source":"iana","compressible":true},"application/geo+json":{"source":"iana","compressible":true,"extensions":["geojson"]},"application/geo+json-seq":{"source":"iana"},"application/geopackage+sqlite3":{"source":"iana"},"application/geoxacml+xml":{"source":"iana","compressible":true},"application/gltf-buffer":{"source":"iana"},"application/gml+xml":{"source":"iana","compressible":true,"extensions":["gml"]},"application/gpx+xml":{"source":"apache","compressible":true,"extensions":["gpx"]},"application/gxf":{"source":"apache","extensions":["gxf"]},"application/gzip":{"source":"iana","compressible":false,"extensions":["gz"]},"application/h224":{"source":"iana"},"application/held+xml":{"source":"iana","compressible":true},"application/hjson":{"extensions":["hjson"]},"application/hl7v2+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/http":{"source":"iana"},"application/hyperstudio":{"source":"iana","extensions":["stk"]},"application/ibe-key-request+xml":{"source":"iana","compressible":true},"application/ibe-pkg-reply+xml":{"source":"iana","compressible":true},"application/ibe-pp-data":{"source":"iana"},"application/iges":{"source":"iana"},"application/im-iscomposing+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/index":{"source":"iana"},"application/index.cmd":{"source":"iana"},"application/index.obj":{"source":"iana"},"application/index.response":{"source":"iana"},"application/index.vnd":{"source":"iana"},"application/inkml+xml":{"source":"iana","compressible":true,"extensions":["ink","inkml"]},"application/iotp":{"source":"iana"},"application/ipfix":{"source":"iana","extensions":["ipfix"]},"application/ipp":{"source":"iana"},"application/isup":{"source":"iana"},"application/its+xml":{"source":"iana","compressible":true,"extensions":["its"]},"application/java-archive":{"source":"apache","compressible":false,"extensions":["jar","war","ear"]},"application/java-serialized-object":{"source":"apache","compressible":false,"extensions":["ser"]},"application/java-vm":{"source":"apache","compressible":false,"extensions":["class"]},"application/javascript":{"source":"apache","charset":"UTF-8","compressible":true,"extensions":["js"]},"application/jf2feed+json":{"source":"iana","compressible":true},"application/jose":{"source":"iana"},"application/jose+json":{"source":"iana","compressible":true},"application/jrd+json":{"source":"iana","compressible":true},"application/jscalendar+json":{"source":"iana","compressible":true},"application/json":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["json","map"]},"application/json-patch+json":{"source":"iana","compressible":true},"application/json-seq":{"source":"iana"},"application/json5":{"extensions":["json5"]},"application/jsonml+json":{"source":"apache","compressible":true,"extensions":["jsonml"]},"application/jwk+json":{"source":"iana","compressible":true},"application/jwk-set+json":{"source":"iana","compressible":true},"application/jwt":{"source":"iana"},"application/kpml-request+xml":{"source":"iana","compressible":true},"application/kpml-response+xml":{"source":"iana","compressible":true},"application/ld+json":{"source":"iana","compressible":true,"extensions":["jsonld"]},"application/lgr+xml":{"source":"iana","compressible":true,"extensions":["lgr"]},"application/link-format":{"source":"iana"},"application/linkset":{"source":"iana"},"application/linkset+json":{"source":"iana","compressible":true},"application/load-control+xml":{"source":"iana","compressible":true},"application/lost+xml":{"source":"iana","compressible":true,"extensions":["lostxml"]},"application/lostsync+xml":{"source":"iana","compressible":true},"application/lpf+zip":{"source":"iana","compressible":false},"application/lxf":{"source":"iana"},"application/mac-binhex40":{"source":"iana","extensions":["hqx"]},"application/mac-compactpro":{"source":"apache","extensions":["cpt"]},"application/macwriteii":{"source":"iana"},"application/mads+xml":{"source":"iana","compressible":true,"extensions":["mads"]},"application/manifest+json":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["webmanifest"]},"application/marc":{"source":"iana","extensions":["mrc"]},"application/marcxml+xml":{"source":"iana","compressible":true,"extensions":["mrcx"]},"application/mathematica":{"source":"iana","extensions":["ma","nb","mb"]},"application/mathml+xml":{"source":"iana","compressible":true,"extensions":["mathml"]},"application/mathml-content+xml":{"source":"iana","compressible":true},"application/mathml-presentation+xml":{"source":"iana","compressible":true},"application/mbms-associated-procedure-description+xml":{"source":"iana","compressible":true},"application/mbms-deregister+xml":{"source":"iana","compressible":true},"application/mbms-envelope+xml":{"source":"iana","compressible":true},"application/mbms-msk+xml":{"source":"iana","compressible":true},"application/mbms-msk-response+xml":{"source":"iana","compressible":true},"application/mbms-protection-description+xml":{"source":"iana","compressible":true},"application/mbms-reception-report+xml":{"source":"iana","compressible":true},"application/mbms-register+xml":{"source":"iana","compressible":true},"application/mbms-register-response+xml":{"source":"iana","compressible":true},"application/mbms-schedule+xml":{"source":"iana","compressible":true},"application/mbms-user-service-description+xml":{"source":"iana","compressible":true},"application/mbox":{"source":"iana","extensions":["mbox"]},"application/media-policy-dataset+xml":{"source":"iana","compressible":true,"extensions":["mpf"]},"application/media_control+xml":{"source":"iana","compressible":true},"application/mediaservercontrol+xml":{"source":"iana","compressible":true,"extensions":["mscml"]},"application/merge-patch+json":{"source":"iana","compressible":true},"application/metalink+xml":{"source":"apache","compressible":true,"extensions":["metalink"]},"application/metalink4+xml":{"source":"iana","compressible":true,"extensions":["meta4"]},"application/mets+xml":{"source":"iana","compressible":true,"extensions":["mets"]},"application/mf4":{"source":"iana"},"application/mikey":{"source":"iana"},"application/mipc":{"source":"iana"},"application/missing-blocks+cbor-seq":{"source":"iana"},"application/mmt-aei+xml":{"source":"iana","compressible":true,"extensions":["maei"]},"application/mmt-usd+xml":{"source":"iana","compressible":true,"extensions":["musd"]},"application/mods+xml":{"source":"iana","compressible":true,"extensions":["mods"]},"application/moss-keys":{"source":"iana"},"application/moss-signature":{"source":"iana"},"application/mosskey-data":{"source":"iana"},"application/mosskey-request":{"source":"iana"},"application/mp21":{"source":"iana","extensions":["m21","mp21"]},"application/mp4":{"source":"iana","extensions":["mp4s","m4p"]},"application/mpeg4-generic":{"source":"iana"},"application/mpeg4-iod":{"source":"iana"},"application/mpeg4-iod-xmt":{"source":"iana"},"application/mrb-consumer+xml":{"source":"iana","compressible":true},"application/mrb-publish+xml":{"source":"iana","compressible":true},"application/msc-ivr+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/msc-mixer+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/msword":{"source":"iana","compressible":false,"extensions":["doc","dot"]},"application/mud+json":{"source":"iana","compressible":true},"application/multipart-core":{"source":"iana"},"application/mxf":{"source":"iana","extensions":["mxf"]},"application/n-quads":{"source":"iana","extensions":["nq"]},"application/n-triples":{"source":"iana","extensions":["nt"]},"application/nasdata":{"source":"iana"},"application/news-checkgroups":{"source":"iana","charset":"US-ASCII"},"application/news-groupinfo":{"source":"iana","charset":"US-ASCII"},"application/news-transmission":{"source":"iana"},"application/nlsml+xml":{"source":"iana","compressible":true},"application/node":{"source":"iana","extensions":["cjs"]},"application/nss":{"source":"iana"},"application/oauth-authz-req+jwt":{"source":"iana"},"application/oblivious-dns-message":{"source":"iana"},"application/ocsp-request":{"source":"iana"},"application/ocsp-response":{"source":"iana"},"application/octet-stream":{"source":"iana","compressible":false,"extensions":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"]},"application/oda":{"source":"iana","extensions":["oda"]},"application/odm+xml":{"source":"iana","compressible":true},"application/odx":{"source":"iana"},"application/oebps-package+xml":{"source":"iana","compressible":true,"extensions":["opf"]},"application/ogg":{"source":"iana","compressible":false,"extensions":["ogx"]},"application/omdoc+xml":{"source":"apache","compressible":true,"extensions":["omdoc"]},"application/onenote":{"source":"apache","extensions":["onetoc","onetoc2","onetmp","onepkg"]},"application/opc-nodeset+xml":{"source":"iana","compressible":true},"application/oscore":{"source":"iana"},"application/oxps":{"source":"iana","extensions":["oxps"]},"application/p21":{"source":"iana"},"application/p21+zip":{"source":"iana","compressible":false},"application/p2p-overlay+xml":{"source":"iana","compressible":true,"extensions":["relo"]},"application/parityfec":{"source":"iana"},"application/passport":{"source":"iana"},"application/patch-ops-error+xml":{"source":"iana","compressible":true,"extensions":["xer"]},"application/pdf":{"source":"iana","compressible":false,"extensions":["pdf"]},"application/pdx":{"source":"iana"},"application/pem-certificate-chain":{"source":"iana"},"application/pgp-encrypted":{"source":"iana","compressible":false,"extensions":["pgp"]},"application/pgp-keys":{"source":"iana","extensions":["asc"]},"application/pgp-signature":{"source":"iana","extensions":["sig","asc"]},"application/pics-rules":{"source":"apache","extensions":["prf"]},"application/pidf+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/pidf-diff+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/pkcs10":{"source":"iana","extensions":["p10"]},"application/pkcs12":{"source":"iana"},"application/pkcs7-mime":{"source":"iana","extensions":["p7m","p7c"]},"application/pkcs7-signature":{"source":"iana","extensions":["p7s"]},"application/pkcs8":{"source":"iana","extensions":["p8"]},"application/pkcs8-encrypted":{"source":"iana"},"application/pkix-attr-cert":{"source":"iana","extensions":["ac"]},"application/pkix-cert":{"source":"iana","extensions":["cer"]},"application/pkix-crl":{"source":"iana","extensions":["crl"]},"application/pkix-pkipath":{"source":"iana","extensions":["pkipath"]},"application/pkixcmp":{"source":"iana","extensions":["pki"]},"application/pls+xml":{"source":"iana","compressible":true,"extensions":["pls"]},"application/poc-settings+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/postscript":{"source":"iana","compressible":true,"extensions":["ai","eps","ps"]},"application/ppsp-tracker+json":{"source":"iana","compressible":true},"application/problem+json":{"source":"iana","compressible":true},"application/problem+xml":{"source":"iana","compressible":true},"application/provenance+xml":{"source":"iana","compressible":true,"extensions":["provx"]},"application/prs.alvestrand.titrax-sheet":{"source":"iana"},"application/prs.cww":{"source":"iana","extensions":["cww"]},"application/prs.cyn":{"source":"iana","charset":"7-BIT"},"application/prs.hpub+zip":{"source":"iana","compressible":false},"application/prs.nprend":{"source":"iana"},"application/prs.plucker":{"source":"iana"},"application/prs.rdf-xml-crypt":{"source":"iana"},"application/prs.xsf+xml":{"source":"iana","compressible":true,"extensions":["xsf"]},"application/pskc+xml":{"source":"iana","compressible":true,"extensions":["pskcxml"]},"application/pvd+json":{"source":"iana","compressible":true},"application/qsig":{"source":"iana"},"application/raml+yaml":{"compressible":true,"extensions":["raml"]},"application/raptorfec":{"source":"iana"},"application/rdap+json":{"source":"iana","compressible":true},"application/rdf+xml":{"source":"iana","compressible":true,"extensions":["rdf","owl"]},"application/reginfo+xml":{"source":"iana","compressible":true,"extensions":["rif"]},"application/relax-ng-compact-syntax":{"source":"iana","extensions":["rnc"]},"application/remote-printing":{"source":"iana"},"application/reputon+json":{"source":"iana","compressible":true},"application/resource-lists+xml":{"source":"iana","compressible":true,"extensions":["rl"]},"application/resource-lists-diff+xml":{"source":"iana","compressible":true,"extensions":["rld"]},"application/rfc+xml":{"source":"iana","compressible":true},"application/riscos":{"source":"iana"},"application/rlmi+xml":{"source":"iana","compressible":true},"application/rls-services+xml":{"source":"iana","compressible":true,"extensions":["rs"]},"application/route-apd+xml":{"source":"iana","compressible":true,"extensions":["rapd"]},"application/route-s-tsid+xml":{"source":"iana","compressible":true,"extensions":["sls"]},"application/route-usd+xml":{"source":"iana","compressible":true,"extensions":["rusd"]},"application/rpki-ghostbusters":{"source":"iana","extensions":["gbr"]},"application/rpki-manifest":{"source":"iana","extensions":["mft"]},"application/rpki-publication":{"source":"iana"},"application/rpki-roa":{"source":"iana","extensions":["roa"]},"application/rpki-updown":{"source":"iana"},"application/rsd+xml":{"source":"apache","compressible":true,"extensions":["rsd"]},"application/rss+xml":{"source":"apache","compressible":true,"extensions":["rss"]},"application/rtf":{"source":"iana","compressible":true,"extensions":["rtf"]},"application/rtploopback":{"source":"iana"},"application/rtx":{"source":"iana"},"application/samlassertion+xml":{"source":"iana","compressible":true},"application/samlmetadata+xml":{"source":"iana","compressible":true},"application/sarif+json":{"source":"iana","compressible":true},"application/sarif-external-properties+json":{"source":"iana","compressible":true},"application/sbe":{"source":"iana"},"application/sbml+xml":{"source":"iana","compressible":true,"extensions":["sbml"]},"application/scaip+xml":{"source":"iana","compressible":true},"application/scim+json":{"source":"iana","compressible":true},"application/scvp-cv-request":{"source":"iana","extensions":["scq"]},"application/scvp-cv-response":{"source":"iana","extensions":["scs"]},"application/scvp-vp-request":{"source":"iana","extensions":["spq"]},"application/scvp-vp-response":{"source":"iana","extensions":["spp"]},"application/sdp":{"source":"iana","extensions":["sdp"]},"application/secevent+jwt":{"source":"iana"},"application/senml+cbor":{"source":"iana"},"application/senml+json":{"source":"iana","compressible":true},"application/senml+xml":{"source":"iana","compressible":true,"extensions":["senmlx"]},"application/senml-etch+cbor":{"source":"iana"},"application/senml-etch+json":{"source":"iana","compressible":true},"application/senml-exi":{"source":"iana"},"application/sensml+cbor":{"source":"iana"},"application/sensml+json":{"source":"iana","compressible":true},"application/sensml+xml":{"source":"iana","compressible":true,"extensions":["sensmlx"]},"application/sensml-exi":{"source":"iana"},"application/sep+xml":{"source":"iana","compressible":true},"application/sep-exi":{"source":"iana"},"application/session-info":{"source":"iana"},"application/set-payment":{"source":"iana"},"application/set-payment-initiation":{"source":"iana","extensions":["setpay"]},"application/set-registration":{"source":"iana"},"application/set-registration-initiation":{"source":"iana","extensions":["setreg"]},"application/sgml":{"source":"iana"},"application/sgml-open-catalog":{"source":"iana"},"application/shf+xml":{"source":"iana","compressible":true,"extensions":["shf"]},"application/sieve":{"source":"iana","extensions":["siv","sieve"]},"application/simple-filter+xml":{"source":"iana","compressible":true},"application/simple-message-summary":{"source":"iana"},"application/simplesymbolcontainer":{"source":"iana"},"application/sipc":{"source":"iana"},"application/slate":{"source":"iana"},"application/smil":{"source":"apache"},"application/smil+xml":{"source":"iana","compressible":true,"extensions":["smi","smil"]},"application/smpte336m":{"source":"iana"},"application/soap+fastinfoset":{"source":"iana"},"application/soap+xml":{"source":"iana","compressible":true},"application/sparql-query":{"source":"iana","extensions":["rq"]},"application/sparql-results+xml":{"source":"iana","compressible":true,"extensions":["srx"]},"application/spdx+json":{"source":"iana","compressible":true},"application/spirits-event+xml":{"source":"iana","compressible":true},"application/sql":{"source":"iana"},"application/srgs":{"source":"iana","extensions":["gram"]},"application/srgs+xml":{"source":"iana","compressible":true,"extensions":["grxml"]},"application/sru+xml":{"source":"iana","compressible":true,"extensions":["sru"]},"application/ssdl+xml":{"source":"apache","compressible":true,"extensions":["ssdl"]},"application/ssml+xml":{"source":"iana","compressible":true,"extensions":["ssml"]},"application/stix+json":{"source":"iana","compressible":true},"application/swid+xml":{"source":"iana","compressible":true,"extensions":["swidtag"]},"application/tamp-apex-update":{"source":"iana"},"application/tamp-apex-update-confirm":{"source":"iana"},"application/tamp-community-update":{"source":"iana"},"application/tamp-community-update-confirm":{"source":"iana"},"application/tamp-error":{"source":"iana"},"application/tamp-sequence-adjust":{"source":"iana"},"application/tamp-sequence-adjust-confirm":{"source":"iana"},"application/tamp-status-query":{"source":"iana"},"application/tamp-status-response":{"source":"iana"},"application/tamp-update":{"source":"iana"},"application/tamp-update-confirm":{"source":"iana"},"application/tar":{"compressible":true},"application/taxii+json":{"source":"iana","compressible":true},"application/td+json":{"source":"iana","compressible":true},"application/tei+xml":{"source":"iana","compressible":true,"extensions":["tei","teicorpus"]},"application/tetra_isi":{"source":"iana"},"application/thraud+xml":{"source":"iana","compressible":true,"extensions":["tfi"]},"application/timestamp-query":{"source":"iana"},"application/timestamp-reply":{"source":"iana"},"application/timestamped-data":{"source":"iana","extensions":["tsd"]},"application/tlsrpt+gzip":{"source":"iana"},"application/tlsrpt+json":{"source":"iana","compressible":true},"application/tnauthlist":{"source":"iana"},"application/token-introspection+jwt":{"source":"iana"},"application/toml":{"compressible":true,"extensions":["toml"]},"application/trickle-ice-sdpfrag":{"source":"iana"},"application/trig":{"source":"iana","extensions":["trig"]},"application/ttml+xml":{"source":"iana","compressible":true,"extensions":["ttml"]},"application/tve-trigger":{"source":"iana"},"application/tzif":{"source":"iana"},"application/tzif-leap":{"source":"iana"},"application/ubjson":{"compressible":false,"extensions":["ubj"]},"application/ulpfec":{"source":"iana"},"application/urc-grpsheet+xml":{"source":"iana","compressible":true},"application/urc-ressheet+xml":{"source":"iana","compressible":true,"extensions":["rsheet"]},"application/urc-targetdesc+xml":{"source":"iana","compressible":true,"extensions":["td"]},"application/urc-uisocketdesc+xml":{"source":"iana","compressible":true},"application/vcard+json":{"source":"iana","compressible":true},"application/vcard+xml":{"source":"iana","compressible":true},"application/vemmi":{"source":"iana"},"application/vividence.scriptfile":{"source":"apache"},"application/vnd.1000minds.decision-model+xml":{"source":"iana","compressible":true,"extensions":["1km"]},"application/vnd.3gpp-prose+xml":{"source":"iana","compressible":true},"application/vnd.3gpp-prose-pc3ch+xml":{"source":"iana","compressible":true},"application/vnd.3gpp-v2x-local-service-information":{"source":"iana"},"application/vnd.3gpp.5gnas":{"source":"iana"},"application/vnd.3gpp.access-transfer-events+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.bsf+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.gmop+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.gtpc":{"source":"iana"},"application/vnd.3gpp.interworking-data":{"source":"iana"},"application/vnd.3gpp.lpp":{"source":"iana"},"application/vnd.3gpp.mc-signalling-ear":{"source":"iana"},"application/vnd.3gpp.mcdata-affiliation-command+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-payload":{"source":"iana"},"application/vnd.3gpp.mcdata-regroup+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-service-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-signalling":{"source":"iana"},"application/vnd.3gpp.mcdata-ue-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-user-profile+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-affiliation-command+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-floor-request+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-location-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-mbms-usage-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-service-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-signed+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-ue-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-ue-init-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-user-profile+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-affiliation-command+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-location-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-mbms-usage-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-service-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-transmission-request+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-ue-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-user-profile+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mid-call+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.ngap":{"source":"iana"},"application/vnd.3gpp.pfcp":{"source":"iana"},"application/vnd.3gpp.pic-bw-large":{"source":"iana","extensions":["plb"]},"application/vnd.3gpp.pic-bw-small":{"source":"iana","extensions":["psb"]},"application/vnd.3gpp.pic-bw-var":{"source":"iana","extensions":["pvb"]},"application/vnd.3gpp.s1ap":{"source":"iana"},"application/vnd.3gpp.sms":{"source":"iana"},"application/vnd.3gpp.sms+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.srvcc-ext+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.srvcc-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.state-and-event-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.ussd+xml":{"source":"iana","compressible":true},"application/vnd.3gpp2.bcmcsinfo+xml":{"source":"iana","compressible":true},"application/vnd.3gpp2.sms":{"source":"iana"},"application/vnd.3gpp2.tcap":{"source":"iana","extensions":["tcap"]},"application/vnd.3lightssoftware.imagescal":{"source":"iana"},"application/vnd.3m.post-it-notes":{"source":"iana","extensions":["pwn"]},"application/vnd.accpac.simply.aso":{"source":"iana","extensions":["aso"]},"application/vnd.accpac.simply.imp":{"source":"iana","extensions":["imp"]},"application/vnd.acucobol":{"source":"iana","extensions":["acu"]},"application/vnd.acucorp":{"source":"iana","extensions":["atc","acutc"]},"application/vnd.adobe.air-application-installer-package+zip":{"source":"apache","compressible":false,"extensions":["air"]},"application/vnd.adobe.flash.movie":{"source":"iana"},"application/vnd.adobe.formscentral.fcdt":{"source":"iana","extensions":["fcdt"]},"application/vnd.adobe.fxp":{"source":"iana","extensions":["fxp","fxpl"]},"application/vnd.adobe.partial-upload":{"source":"iana"},"application/vnd.adobe.xdp+xml":{"source":"iana","compressible":true,"extensions":["xdp"]},"application/vnd.adobe.xfdf":{"source":"apache","extensions":["xfdf"]},"application/vnd.aether.imp":{"source":"iana"},"application/vnd.afpc.afplinedata":{"source":"iana"},"application/vnd.afpc.afplinedata-pagedef":{"source":"iana"},"application/vnd.afpc.cmoca-cmresource":{"source":"iana"},"application/vnd.afpc.foca-charset":{"source":"iana"},"application/vnd.afpc.foca-codedfont":{"source":"iana"},"application/vnd.afpc.foca-codepage":{"source":"iana"},"application/vnd.afpc.modca":{"source":"iana"},"application/vnd.afpc.modca-cmtable":{"source":"iana"},"application/vnd.afpc.modca-formdef":{"source":"iana"},"application/vnd.afpc.modca-mediummap":{"source":"iana"},"application/vnd.afpc.modca-objectcontainer":{"source":"iana"},"application/vnd.afpc.modca-overlay":{"source":"iana"},"application/vnd.afpc.modca-pagesegment":{"source":"iana"},"application/vnd.age":{"source":"iana","extensions":["age"]},"application/vnd.ah-barcode":{"source":"apache"},"application/vnd.ahead.space":{"source":"iana","extensions":["ahead"]},"application/vnd.airzip.filesecure.azf":{"source":"iana","extensions":["azf"]},"application/vnd.airzip.filesecure.azs":{"source":"iana","extensions":["azs"]},"application/vnd.amadeus+json":{"source":"iana","compressible":true},"application/vnd.amazon.ebook":{"source":"apache","extensions":["azw"]},"application/vnd.amazon.mobi8-ebook":{"source":"iana"},"application/vnd.americandynamics.acc":{"source":"iana","extensions":["acc"]},"application/vnd.amiga.ami":{"source":"iana","extensions":["ami"]},"application/vnd.amundsen.maze+xml":{"source":"iana","compressible":true},"application/vnd.android.ota":{"source":"iana"},"application/vnd.android.package-archive":{"source":"apache","compressible":false,"extensions":["apk"]},"application/vnd.anki":{"source":"iana"},"application/vnd.anser-web-certificate-issue-initiation":{"source":"iana","extensions":["cii"]},"application/vnd.anser-web-funds-transfer-initiation":{"source":"apache","extensions":["fti"]},"application/vnd.antix.game-component":{"source":"iana","extensions":["atx"]},"application/vnd.apache.arrow.file":{"source":"iana"},"application/vnd.apache.arrow.stream":{"source":"iana"},"application/vnd.apache.thrift.binary":{"source":"iana"},"application/vnd.apache.thrift.compact":{"source":"iana"},"application/vnd.apache.thrift.json":{"source":"iana"},"application/vnd.api+json":{"source":"iana","compressible":true},"application/vnd.aplextor.warrp+json":{"source":"iana","compressible":true},"application/vnd.apothekende.reservation+json":{"source":"iana","compressible":true},"application/vnd.apple.installer+xml":{"source":"iana","compressible":true,"extensions":["mpkg"]},"application/vnd.apple.keynote":{"source":"iana","extensions":["key"]},"application/vnd.apple.mpegurl":{"source":"iana","extensions":["m3u8"]},"application/vnd.apple.numbers":{"source":"iana","extensions":["numbers"]},"application/vnd.apple.pages":{"source":"iana","extensions":["pages"]},"application/vnd.apple.pkpass":{"compressible":false,"extensions":["pkpass"]},"application/vnd.arastra.swi":{"source":"apache"},"application/vnd.aristanetworks.swi":{"source":"iana","extensions":["swi"]},"application/vnd.artisan+json":{"source":"iana","compressible":true},"application/vnd.artsquare":{"source":"iana"},"application/vnd.astraea-software.iota":{"source":"iana","extensions":["iota"]},"application/vnd.audiograph":{"source":"iana","extensions":["aep"]},"application/vnd.autopackage":{"source":"iana"},"application/vnd.avalon+json":{"source":"iana","compressible":true},"application/vnd.avistar+xml":{"source":"iana","compressible":true},"application/vnd.balsamiq.bmml+xml":{"source":"iana","compressible":true,"extensions":["bmml"]},"application/vnd.balsamiq.bmpr":{"source":"iana"},"application/vnd.banana-accounting":{"source":"iana"},"application/vnd.bbf.usp.error":{"source":"iana"},"application/vnd.bbf.usp.msg":{"source":"iana"},"application/vnd.bbf.usp.msg+json":{"source":"iana","compressible":true},"application/vnd.bekitzur-stech+json":{"source":"iana","compressible":true},"application/vnd.belightsoft.lhzd+zip":{"source":"iana","compressible":false},"application/vnd.bint.med-content":{"source":"iana"},"application/vnd.biopax.rdf+xml":{"source":"iana","compressible":true},"application/vnd.blink-idb-value-wrapper":{"source":"iana"},"application/vnd.blueice.multipass":{"source":"iana","extensions":["mpm"]},"application/vnd.bluetooth.ep.oob":{"source":"iana"},"application/vnd.bluetooth.le.oob":{"source":"iana"},"application/vnd.bmi":{"source":"iana","extensions":["bmi"]},"application/vnd.bpf":{"source":"iana"},"application/vnd.bpf3":{"source":"iana"},"application/vnd.businessobjects":{"source":"iana","extensions":["rep"]},"application/vnd.byu.uapi+json":{"source":"iana","compressible":true},"application/vnd.cab-jscript":{"source":"iana"},"application/vnd.canon-cpdl":{"source":"iana"},"application/vnd.canon-lips":{"source":"iana"},"application/vnd.capasystems-pg+json":{"source":"iana","compressible":true},"application/vnd.cendio.thinlinc.clientconf":{"source":"iana"},"application/vnd.century-systems.tcp_stream":{"source":"iana"},"application/vnd.chemdraw+xml":{"source":"iana","compressible":true,"extensions":["cdxml"]},"application/vnd.chess-pgn":{"source":"iana"},"application/vnd.chipnuts.karaoke-mmd":{"source":"iana","extensions":["mmd"]},"application/vnd.ciedi":{"source":"iana"},"application/vnd.cinderella":{"source":"iana","extensions":["cdy"]},"application/vnd.cirpack.isdn-ext":{"source":"iana"},"application/vnd.citationstyles.style+xml":{"source":"iana","compressible":true,"extensions":["csl"]},"application/vnd.claymore":{"source":"iana","extensions":["cla"]},"application/vnd.cloanto.rp9":{"source":"iana","extensions":["rp9"]},"application/vnd.clonk.c4group":{"source":"iana","extensions":["c4g","c4d","c4f","c4p","c4u"]},"application/vnd.cluetrust.cartomobile-config":{"source":"iana","extensions":["c11amc"]},"application/vnd.cluetrust.cartomobile-config-pkg":{"source":"iana","extensions":["c11amz"]},"application/vnd.coffeescript":{"source":"iana"},"application/vnd.collabio.xodocuments.document":{"source":"iana"},"application/vnd.collabio.xodocuments.document-template":{"source":"iana"},"application/vnd.collabio.xodocuments.presentation":{"source":"iana"},"application/vnd.collabio.xodocuments.presentation-template":{"source":"iana"},"application/vnd.collabio.xodocuments.spreadsheet":{"source":"iana"},"application/vnd.collabio.xodocuments.spreadsheet-template":{"source":"iana"},"application/vnd.collection+json":{"source":"iana","compressible":true},"application/vnd.collection.doc+json":{"source":"iana","compressible":true},"application/vnd.collection.next+json":{"source":"iana","compressible":true},"application/vnd.comicbook+zip":{"source":"iana","compressible":false},"application/vnd.comicbook-rar":{"source":"iana"},"application/vnd.commerce-battelle":{"source":"iana"},"application/vnd.commonspace":{"source":"iana","extensions":["csp"]},"application/vnd.contact.cmsg":{"source":"iana","extensions":["cdbcmsg"]},"application/vnd.coreos.ignition+json":{"source":"iana","compressible":true},"application/vnd.cosmocaller":{"source":"iana","extensions":["cmc"]},"application/vnd.crick.clicker":{"source":"iana","extensions":["clkx"]},"application/vnd.crick.clicker.keyboard":{"source":"iana","extensions":["clkk"]},"application/vnd.crick.clicker.palette":{"source":"iana","extensions":["clkp"]},"application/vnd.crick.clicker.template":{"source":"iana","extensions":["clkt"]},"application/vnd.crick.clicker.wordbank":{"source":"iana","extensions":["clkw"]},"application/vnd.criticaltools.wbs+xml":{"source":"iana","compressible":true,"extensions":["wbs"]},"application/vnd.cryptii.pipe+json":{"source":"iana","compressible":true},"application/vnd.crypto-shade-file":{"source":"iana"},"application/vnd.cryptomator.encrypted":{"source":"iana"},"application/vnd.cryptomator.vault":{"source":"iana"},"application/vnd.ctc-posml":{"source":"iana","extensions":["pml"]},"application/vnd.ctct.ws+xml":{"source":"iana","compressible":true},"application/vnd.cups-pdf":{"source":"iana"},"application/vnd.cups-postscript":{"source":"iana"},"application/vnd.cups-ppd":{"source":"iana","extensions":["ppd"]},"application/vnd.cups-raster":{"source":"iana"},"application/vnd.cups-raw":{"source":"iana"},"application/vnd.curl":{"source":"iana"},"application/vnd.curl.car":{"source":"apache","extensions":["car"]},"application/vnd.curl.pcurl":{"source":"apache","extensions":["pcurl"]},"application/vnd.cyan.dean.root+xml":{"source":"iana","compressible":true},"application/vnd.cybank":{"source":"iana"},"application/vnd.cyclonedx+json":{"source":"iana","compressible":true},"application/vnd.cyclonedx+xml":{"source":"iana","compressible":true},"application/vnd.d2l.coursepackage1p0+zip":{"source":"iana","compressible":false},"application/vnd.d3m-dataset":{"source":"iana"},"application/vnd.d3m-problem":{"source":"iana"},"application/vnd.dart":{"source":"iana","compressible":true,"extensions":["dart"]},"application/vnd.data-vision.rdz":{"source":"iana","extensions":["rdz"]},"application/vnd.datapackage+json":{"source":"iana","compressible":true},"application/vnd.dataresource+json":{"source":"iana","compressible":true},"application/vnd.dbf":{"source":"iana","extensions":["dbf"]},"application/vnd.debian.binary-package":{"source":"iana"},"application/vnd.dece.data":{"source":"iana","extensions":["uvf","uvvf","uvd","uvvd"]},"application/vnd.dece.ttml+xml":{"source":"iana","compressible":true,"extensions":["uvt","uvvt"]},"application/vnd.dece.unspecified":{"source":"iana","extensions":["uvx","uvvx"]},"application/vnd.dece.zip":{"source":"iana","extensions":["uvz","uvvz"]},"application/vnd.denovo.fcselayout-link":{"source":"iana","extensions":["fe_launch"]},"application/vnd.desmume.movie":{"source":"iana"},"application/vnd.dir-bi.plate-dl-nosuffix":{"source":"iana"},"application/vnd.dm.delegation+xml":{"source":"iana","compressible":true},"application/vnd.dna":{"source":"iana","extensions":["dna"]},"application/vnd.document+json":{"source":"iana","compressible":true},"application/vnd.dolby.mlp":{"source":"apache","extensions":["mlp"]},"application/vnd.dolby.mobile.1":{"source":"iana"},"application/vnd.dolby.mobile.2":{"source":"iana"},"application/vnd.doremir.scorecloud-binary-document":{"source":"iana"},"application/vnd.dpgraph":{"source":"iana","extensions":["dpg"]},"application/vnd.dreamfactory":{"source":"iana","extensions":["dfac"]},"application/vnd.drive+json":{"source":"iana","compressible":true},"application/vnd.ds-keypoint":{"source":"apache","extensions":["kpxx"]},"application/vnd.dtg.local":{"source":"iana"},"application/vnd.dtg.local.flash":{"source":"iana"},"application/vnd.dtg.local.html":{"source":"iana"},"application/vnd.dvb.ait":{"source":"iana","extensions":["ait"]},"application/vnd.dvb.dvbisl+xml":{"source":"iana","compressible":true},"application/vnd.dvb.dvbj":{"source":"iana"},"application/vnd.dvb.esgcontainer":{"source":"iana"},"application/vnd.dvb.ipdcdftnotifaccess":{"source":"iana"},"application/vnd.dvb.ipdcesgaccess":{"source":"iana"},"application/vnd.dvb.ipdcesgaccess2":{"source":"iana"},"application/vnd.dvb.ipdcesgpdd":{"source":"iana"},"application/vnd.dvb.ipdcroaming":{"source":"iana"},"application/vnd.dvb.iptv.alfec-base":{"source":"iana"},"application/vnd.dvb.iptv.alfec-enhancement":{"source":"iana"},"application/vnd.dvb.notif-aggregate-root+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-container+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-generic+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-ia-msglist+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-ia-registration-request+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-ia-registration-response+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-init+xml":{"source":"iana","compressible":true},"application/vnd.dvb.pfr":{"source":"iana"},"application/vnd.dvb.service":{"source":"iana","extensions":["svc"]},"application/vnd.dxr":{"source":"iana"},"application/vnd.dynageo":{"source":"iana","extensions":["geo"]},"application/vnd.dzr":{"source":"iana"},"application/vnd.easykaraoke.cdgdownload":{"source":"iana"},"application/vnd.ecdis-update":{"source":"iana"},"application/vnd.ecip.rlp":{"source":"iana"},"application/vnd.eclipse.ditto+json":{"source":"iana","compressible":true},"application/vnd.ecowin.chart":{"source":"iana","extensions":["mag"]},"application/vnd.ecowin.filerequest":{"source":"iana"},"application/vnd.ecowin.fileupdate":{"source":"iana"},"application/vnd.ecowin.series":{"source":"iana"},"application/vnd.ecowin.seriesrequest":{"source":"iana"},"application/vnd.ecowin.seriesupdate":{"source":"iana"},"application/vnd.efi.img":{"source":"iana"},"application/vnd.efi.iso":{"source":"iana"},"application/vnd.emclient.accessrequest+xml":{"source":"iana","compressible":true},"application/vnd.enliven":{"source":"iana","extensions":["nml"]},"application/vnd.enphase.envoy":{"source":"iana"},"application/vnd.eprints.data+xml":{"source":"iana","compressible":true},"application/vnd.epson.esf":{"source":"iana","extensions":["esf"]},"application/vnd.epson.msf":{"source":"iana","extensions":["msf"]},"application/vnd.epson.quickanime":{"source":"iana","extensions":["qam"]},"application/vnd.epson.salt":{"source":"iana","extensions":["slt"]},"application/vnd.epson.ssf":{"source":"iana","extensions":["ssf"]},"application/vnd.ericsson.quickcall":{"source":"iana"},"application/vnd.espass-espass+zip":{"source":"iana","compressible":false},"application/vnd.eszigno3+xml":{"source":"iana","compressible":true,"extensions":["es3","et3"]},"application/vnd.etsi.aoc+xml":{"source":"iana","compressible":true},"application/vnd.etsi.asic-e+zip":{"source":"iana","compressible":false},"application/vnd.etsi.asic-s+zip":{"source":"iana","compressible":false},"application/vnd.etsi.cug+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvcommand+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvdiscovery+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvprofile+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsad-bc+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsad-cod+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsad-npvr+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvservice+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsync+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvueprofile+xml":{"source":"iana","compressible":true},"application/vnd.etsi.mcid+xml":{"source":"iana","compressible":true},"application/vnd.etsi.mheg5":{"source":"iana"},"application/vnd.etsi.overload-control-policy-dataset+xml":{"source":"iana","compressible":true},"application/vnd.etsi.pstn+xml":{"source":"iana","compressible":true},"application/vnd.etsi.sci+xml":{"source":"iana","compressible":true},"application/vnd.etsi.simservs+xml":{"source":"iana","compressible":true},"application/vnd.etsi.timestamp-token":{"source":"iana"},"application/vnd.etsi.tsl+xml":{"source":"iana","compressible":true},"application/vnd.etsi.tsl.der":{"source":"iana"},"application/vnd.eu.kasparian.car+json":{"source":"iana","compressible":true},"application/vnd.eudora.data":{"source":"iana"},"application/vnd.evolv.ecig.profile":{"source":"iana"},"application/vnd.evolv.ecig.settings":{"source":"iana"},"application/vnd.evolv.ecig.theme":{"source":"iana"},"application/vnd.exstream-empower+zip":{"source":"iana","compressible":false},"application/vnd.exstream-package":{"source":"iana"},"application/vnd.ezpix-album":{"source":"iana","extensions":["ez2"]},"application/vnd.ezpix-package":{"source":"iana","extensions":["ez3"]},"application/vnd.f-secure.mobile":{"source":"iana"},"application/vnd.familysearch.gedcom+zip":{"source":"iana","compressible":false},"application/vnd.fastcopy-disk-image":{"source":"iana"},"application/vnd.fdf":{"source":"apache","extensions":["fdf"]},"application/vnd.fdsn.mseed":{"source":"iana","extensions":["mseed"]},"application/vnd.fdsn.seed":{"source":"iana","extensions":["seed","dataless"]},"application/vnd.ffsns":{"source":"iana"},"application/vnd.ficlab.flb+zip":{"source":"iana","compressible":false},"application/vnd.filmit.zfc":{"source":"iana"},"application/vnd.fints":{"source":"iana"},"application/vnd.firemonkeys.cloudcell":{"source":"iana"},"application/vnd.flographit":{"source":"iana","extensions":["gph"]},"application/vnd.fluxtime.clip":{"source":"iana","extensions":["ftc"]},"application/vnd.font-fontforge-sfd":{"source":"iana"},"application/vnd.framemaker":{"source":"iana","extensions":["fm","frame","maker","book"]},"application/vnd.frogans.fnc":{"source":"apache","extensions":["fnc"]},"application/vnd.frogans.ltf":{"source":"apache","extensions":["ltf"]},"application/vnd.fsc.weblaunch":{"source":"iana","extensions":["fsc"]},"application/vnd.fujifilm.fb.docuworks":{"source":"iana"},"application/vnd.fujifilm.fb.docuworks.binder":{"source":"iana"},"application/vnd.fujifilm.fb.docuworks.container":{"source":"iana"},"application/vnd.fujifilm.fb.jfi+xml":{"source":"iana","compressible":true},"application/vnd.fujitsu.oasys":{"source":"iana","extensions":["oas"]},"application/vnd.fujitsu.oasys2":{"source":"iana","extensions":["oa2"]},"application/vnd.fujitsu.oasys3":{"source":"iana","extensions":["oa3"]},"application/vnd.fujitsu.oasysgp":{"source":"iana","extensions":["fg5"]},"application/vnd.fujitsu.oasysprs":{"source":"iana","extensions":["bh2"]},"application/vnd.fujixerox.art-ex":{"source":"iana"},"application/vnd.fujixerox.art4":{"source":"iana"},"application/vnd.fujixerox.ddd":{"source":"iana","extensions":["ddd"]},"application/vnd.fujixerox.docuworks":{"source":"iana","extensions":["xdw"]},"application/vnd.fujixerox.docuworks.binder":{"source":"iana","extensions":["xbd"]},"application/vnd.fujixerox.docuworks.container":{"source":"iana"},"application/vnd.fujixerox.hbpl":{"source":"iana"},"application/vnd.fut-misnet":{"source":"iana"},"application/vnd.futoin+cbor":{"source":"iana"},"application/vnd.futoin+json":{"source":"iana","compressible":true},"application/vnd.fuzzysheet":{"source":"iana","extensions":["fzs"]},"application/vnd.genomatix.tuxedo":{"source":"iana","extensions":["txd"]},"application/vnd.genozip":{"source":"iana"},"application/vnd.gentics.grd+json":{"source":"iana","compressible":true},"application/vnd.geo+json":{"source":"apache","compressible":true},"application/vnd.geocube+xml":{"source":"apache","compressible":true},"application/vnd.geogebra.file":{"source":"iana","extensions":["ggb"]},"application/vnd.geogebra.slides":{"source":"iana"},"application/vnd.geogebra.tool":{"source":"iana","extensions":["ggt"]},"application/vnd.geometry-explorer":{"source":"iana","extensions":["gex","gre"]},"application/vnd.geonext":{"source":"iana","extensions":["gxt"]},"application/vnd.geoplan":{"source":"iana","extensions":["g2w"]},"application/vnd.geospace":{"source":"iana","extensions":["g3w"]},"application/vnd.gerber":{"source":"iana"},"application/vnd.globalplatform.card-content-mgt":{"source":"iana"},"application/vnd.globalplatform.card-content-mgt-response":{"source":"iana"},"application/vnd.gmx":{"source":"iana","extensions":["gmx"]},"application/vnd.gnu.taler.exchange+json":{"source":"iana","compressible":true},"application/vnd.gnu.taler.merchant+json":{"source":"iana","compressible":true},"application/vnd.google-apps.document":{"compressible":false,"extensions":["gdoc"]},"application/vnd.google-apps.presentation":{"compressible":false,"extensions":["gslides"]},"application/vnd.google-apps.spreadsheet":{"compressible":false,"extensions":["gsheet"]},"application/vnd.google-earth.kml+xml":{"source":"iana","compressible":true,"extensions":["kml"]},"application/vnd.google-earth.kmz":{"source":"iana","compressible":false,"extensions":["kmz"]},"application/vnd.gov.sk.e-form+xml":{"source":"iana","compressible":true},"application/vnd.gov.sk.e-form+zip":{"source":"iana","compressible":false},"application/vnd.gov.sk.xmldatacontainer+xml":{"source":"iana","compressible":true},"application/vnd.grafeq":{"source":"iana","extensions":["gqf","gqs"]},"application/vnd.gridmp":{"source":"iana"},"application/vnd.groove-account":{"source":"iana","extensions":["gac"]},"application/vnd.groove-help":{"source":"iana","extensions":["ghf"]},"application/vnd.groove-identity-message":{"source":"iana","extensions":["gim"]},"application/vnd.groove-injector":{"source":"iana","extensions":["grv"]},"application/vnd.groove-tool-message":{"source":"iana","extensions":["gtm"]},"application/vnd.groove-tool-template":{"source":"iana","extensions":["tpl"]},"application/vnd.groove-vcard":{"source":"iana","extensions":["vcg"]},"application/vnd.hal+json":{"source":"iana","compressible":true},"application/vnd.hal+xml":{"source":"iana","compressible":true,"extensions":["hal"]},"application/vnd.handheld-entertainment+xml":{"source":"iana","compressible":true,"extensions":["zmm"]},"application/vnd.hbci":{"source":"iana","extensions":["hbci"]},"application/vnd.hc+json":{"source":"iana","compressible":true},"application/vnd.hcl-bireports":{"source":"iana"},"application/vnd.hdt":{"source":"iana"},"application/vnd.heroku+json":{"source":"iana","compressible":true},"application/vnd.hhe.lesson-player":{"source":"iana","extensions":["les"]},"application/vnd.hp-hpgl":{"source":"iana","extensions":["hpgl"]},"application/vnd.hp-hpid":{"source":"iana","extensions":["hpid"]},"application/vnd.hp-hps":{"source":"iana","extensions":["hps"]},"application/vnd.hp-jlyt":{"source":"iana","extensions":["jlt"]},"application/vnd.hp-pcl":{"source":"iana","extensions":["pcl"]},"application/vnd.hp-pclxl":{"source":"iana","extensions":["pclxl"]},"application/vnd.httphone":{"source":"iana"},"application/vnd.hydrostatix.sof-data":{"source":"iana","extensions":["sfd-hdstx"]},"application/vnd.hyper+json":{"source":"iana","compressible":true},"application/vnd.hyper-item+json":{"source":"iana","compressible":true},"application/vnd.hyperdrive+json":{"source":"iana","compressible":true},"application/vnd.hzn-3d-crossword":{"source":"iana"},"application/vnd.ibm.afplinedata":{"source":"apache"},"application/vnd.ibm.electronic-media":{"source":"iana"},"application/vnd.ibm.minipay":{"source":"iana","extensions":["mpy"]},"application/vnd.ibm.modcap":{"source":"apache","extensions":["afp","listafp","list3820"]},"application/vnd.ibm.rights-management":{"source":"iana","extensions":["irm"]},"application/vnd.ibm.secure-container":{"source":"iana","extensions":["sc"]},"application/vnd.iccprofile":{"source":"iana","extensions":["icc","icm"]},"application/vnd.ieee.1905":{"source":"iana"},"application/vnd.igloader":{"source":"iana","extensions":["igl"]},"application/vnd.imagemeter.folder+zip":{"source":"iana","compressible":false},"application/vnd.imagemeter.image+zip":{"source":"iana","compressible":false},"application/vnd.immervision-ivp":{"source":"iana","extensions":["ivp"]},"application/vnd.immervision-ivu":{"source":"iana","extensions":["ivu"]},"application/vnd.ims.imsccv1p1":{"source":"iana"},"application/vnd.ims.imsccv1p2":{"source":"iana"},"application/vnd.ims.imsccv1p3":{"source":"iana"},"application/vnd.ims.lis.v2.result+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolconsumerprofile+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolproxy+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolproxy.id+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolsettings+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolsettings.simple+json":{"source":"iana","compressible":true},"application/vnd.informedcontrol.rms+xml":{"source":"iana","compressible":true},"application/vnd.informix-visionary":{"source":"apache"},"application/vnd.infotech.project":{"source":"iana"},"application/vnd.infotech.project+xml":{"source":"iana","compressible":true},"application/vnd.innopath.wamp.notification":{"source":"iana"},"application/vnd.insors.igm":{"source":"iana","extensions":["igm"]},"application/vnd.intercon.formnet":{"source":"iana","extensions":["xpw","xpx"]},"application/vnd.intergeo":{"source":"iana","extensions":["i2g"]},"application/vnd.intertrust.digibox":{"source":"iana"},"application/vnd.intertrust.nncp":{"source":"iana"},"application/vnd.intu.qbo":{"source":"iana","extensions":["qbo"]},"application/vnd.intu.qfx":{"source":"iana","extensions":["qfx"]},"application/vnd.ipld.car":{"source":"iana"},"application/vnd.ipld.raw":{"source":"iana"},"application/vnd.iptc.g2.catalogitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.conceptitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.knowledgeitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.newsitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.newsmessage+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.packageitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.planningitem+xml":{"source":"iana","compressible":true},"application/vnd.ipunplugged.rcprofile":{"source":"iana","extensions":["rcprofile"]},"application/vnd.irepository.package+xml":{"source":"iana","compressible":true,"extensions":["irp"]},"application/vnd.is-xpr":{"source":"iana","extensions":["xpr"]},"application/vnd.isac.fcs":{"source":"iana","extensions":["fcs"]},"application/vnd.iso11783-10+zip":{"source":"iana","compressible":false},"application/vnd.jam":{"source":"iana","extensions":["jam"]},"application/vnd.japannet-directory-service":{"source":"iana"},"application/vnd.japannet-jpnstore-wakeup":{"source":"iana"},"application/vnd.japannet-payment-wakeup":{"source":"iana"},"application/vnd.japannet-registration":{"source":"iana"},"application/vnd.japannet-registration-wakeup":{"source":"iana"},"application/vnd.japannet-setstore-wakeup":{"source":"iana"},"application/vnd.japannet-verification":{"source":"iana"},"application/vnd.japannet-verification-wakeup":{"source":"iana"},"application/vnd.jcp.javame.midlet-rms":{"source":"iana","extensions":["rms"]},"application/vnd.jisp":{"source":"iana","extensions":["jisp"]},"application/vnd.joost.joda-archive":{"source":"iana","extensions":["joda"]},"application/vnd.jsk.isdn-ngn":{"source":"iana"},"application/vnd.kahootz":{"source":"iana","extensions":["ktz","ktr"]},"application/vnd.kde.karbon":{"source":"iana","extensions":["karbon"]},"application/vnd.kde.kchart":{"source":"iana","extensions":["chrt"]},"application/vnd.kde.kformula":{"source":"iana","extensions":["kfo"]},"application/vnd.kde.kivio":{"source":"iana","extensions":["flw"]},"application/vnd.kde.kontour":{"source":"iana","extensions":["kon"]},"application/vnd.kde.kpresenter":{"source":"iana","extensions":["kpr","kpt"]},"application/vnd.kde.kspread":{"source":"iana","extensions":["ksp"]},"application/vnd.kde.kword":{"source":"iana","extensions":["kwd","kwt"]},"application/vnd.kenameaapp":{"source":"iana","extensions":["htke"]},"application/vnd.kidspiration":{"source":"iana","extensions":["kia"]},"application/vnd.kinar":{"source":"iana","extensions":["kne","knp"]},"application/vnd.koan":{"source":"iana","extensions":["skp","skd","skt","skm"]},"application/vnd.kodak-descriptor":{"source":"iana","extensions":["sse"]},"application/vnd.las":{"source":"iana"},"application/vnd.las.las+json":{"source":"iana","compressible":true},"application/vnd.las.las+xml":{"source":"iana","compressible":true,"extensions":["lasxml"]},"application/vnd.laszip":{"source":"iana"},"application/vnd.leap+json":{"source":"iana","compressible":true},"application/vnd.liberty-request+xml":{"source":"iana","compressible":true},"application/vnd.llamagraphics.life-balance.desktop":{"source":"iana","extensions":["lbd"]},"application/vnd.llamagraphics.life-balance.exchange+xml":{"source":"iana","compressible":true,"extensions":["lbe"]},"application/vnd.logipipe.circuit+zip":{"source":"iana","compressible":false},"application/vnd.loom":{"source":"iana"},"application/vnd.lotus-1-2-3":{"source":"iana","extensions":["123"]},"application/vnd.lotus-approach":{"source":"iana","extensions":["apr"]},"application/vnd.lotus-freelance":{"source":"iana","extensions":["pre"]},"application/vnd.lotus-notes":{"source":"iana","extensions":["nsf"]},"application/vnd.lotus-organizer":{"source":"iana","extensions":["org"]},"application/vnd.lotus-screencam":{"source":"iana","extensions":["scm"]},"application/vnd.lotus-wordpro":{"source":"iana","extensions":["lwp"]},"application/vnd.macports.portpkg":{"source":"iana","extensions":["portpkg"]},"application/vnd.mapbox-vector-tile":{"source":"iana","extensions":["mvt"]},"application/vnd.marlin.drm.actiontoken+xml":{"source":"iana","compressible":true},"application/vnd.marlin.drm.conftoken+xml":{"source":"iana","compressible":true},"application/vnd.marlin.drm.license+xml":{"source":"iana","compressible":true},"application/vnd.marlin.drm.mdcf":{"source":"iana"},"application/vnd.mason+json":{"source":"iana","compressible":true},"application/vnd.maxar.archive.3tz+zip":{"source":"iana","compressible":false},"application/vnd.maxmind.maxmind-db":{"source":"iana"},"application/vnd.mcd":{"source":"iana","extensions":["mcd"]},"application/vnd.medcalcdata":{"source":"iana","extensions":["mc1"]},"application/vnd.mediastation.cdkey":{"source":"iana","extensions":["cdkey"]},"application/vnd.meridian-slingshot":{"source":"iana"},"application/vnd.mfer":{"source":"iana","extensions":["mwf"]},"application/vnd.mfmp":{"source":"iana","extensions":["mfm"]},"application/vnd.micro+json":{"source":"iana","compressible":true},"application/vnd.micrografx.flo":{"source":"iana","extensions":["flo"]},"application/vnd.micrografx.igx":{"source":"iana","extensions":["igx"]},"application/vnd.microsoft.portable-executable":{"source":"iana"},"application/vnd.microsoft.windows.thumbnail-cache":{"source":"iana"},"application/vnd.miele+json":{"source":"iana","compressible":true},"application/vnd.mif":{"source":"iana","extensions":["mif"]},"application/vnd.minisoft-hp3000-save":{"source":"iana"},"application/vnd.mitsubishi.misty-guard.trustweb":{"source":"iana"},"application/vnd.mobius.daf":{"source":"iana","extensions":["daf"]},"application/vnd.mobius.dis":{"source":"iana","extensions":["dis"]},"application/vnd.mobius.mbk":{"source":"iana","extensions":["mbk"]},"application/vnd.mobius.mqy":{"source":"iana","extensions":["mqy"]},"application/vnd.mobius.msl":{"source":"iana","extensions":["msl"]},"application/vnd.mobius.plc":{"source":"iana","extensions":["plc"]},"application/vnd.mobius.txf":{"source":"iana","extensions":["txf"]},"application/vnd.mophun.application":{"source":"iana","extensions":["mpn"]},"application/vnd.mophun.certificate":{"source":"iana","extensions":["mpc"]},"application/vnd.motorola.flexsuite":{"source":"iana"},"application/vnd.motorola.flexsuite.adsi":{"source":"iana"},"application/vnd.motorola.flexsuite.fis":{"source":"iana"},"application/vnd.motorola.flexsuite.gotap":{"source":"iana"},"application/vnd.motorola.flexsuite.kmr":{"source":"iana"},"application/vnd.motorola.flexsuite.ttc":{"source":"iana"},"application/vnd.motorola.flexsuite.wem":{"source":"iana"},"application/vnd.motorola.iprm":{"source":"iana"},"application/vnd.mozilla.xul+xml":{"source":"iana","compressible":true,"extensions":["xul"]},"application/vnd.ms-3mfdocument":{"source":"iana"},"application/vnd.ms-artgalry":{"source":"iana","extensions":["cil"]},"application/vnd.ms-asf":{"source":"iana"},"application/vnd.ms-cab-compressed":{"source":"iana","extensions":["cab"]},"application/vnd.ms-color.iccprofile":{"source":"apache"},"application/vnd.ms-excel":{"source":"iana","compressible":false,"extensions":["xls","xlm","xla","xlc","xlt","xlw"]},"application/vnd.ms-excel.addin.macroenabled.12":{"source":"iana","extensions":["xlam"]},"application/vnd.ms-excel.sheet.binary.macroenabled.12":{"source":"iana","extensions":["xlsb"]},"application/vnd.ms-excel.sheet.macroenabled.12":{"source":"iana","extensions":["xlsm"]},"application/vnd.ms-excel.template.macroenabled.12":{"source":"iana","extensions":["xltm"]},"application/vnd.ms-fontobject":{"source":"iana","compressible":true,"extensions":["eot"]},"application/vnd.ms-htmlhelp":{"source":"iana","extensions":["chm"]},"application/vnd.ms-ims":{"source":"iana","extensions":["ims"]},"application/vnd.ms-lrm":{"source":"iana","extensions":["lrm"]},"application/vnd.ms-office.activex+xml":{"source":"iana","compressible":true},"application/vnd.ms-officetheme":{"source":"iana","extensions":["thmx"]},"application/vnd.ms-opentype":{"source":"apache","compressible":true},"application/vnd.ms-outlook":{"compressible":false,"extensions":["msg"]},"application/vnd.ms-package.obfuscated-opentype":{"source":"apache"},"application/vnd.ms-pki.seccat":{"source":"apache","extensions":["cat"]},"application/vnd.ms-pki.stl":{"source":"apache","extensions":["stl"]},"application/vnd.ms-playready.initiator+xml":{"source":"iana","compressible":true},"application/vnd.ms-powerpoint":{"source":"iana","compressible":false,"extensions":["ppt","pps","pot"]},"application/vnd.ms-powerpoint.addin.macroenabled.12":{"source":"iana","extensions":["ppam"]},"application/vnd.ms-powerpoint.presentation.macroenabled.12":{"source":"iana","extensions":["pptm"]},"application/vnd.ms-powerpoint.slide.macroenabled.12":{"source":"iana","extensions":["sldm"]},"application/vnd.ms-powerpoint.slideshow.macroenabled.12":{"source":"iana","extensions":["ppsm"]},"application/vnd.ms-powerpoint.template.macroenabled.12":{"source":"iana","extensions":["potm"]},"application/vnd.ms-printdevicecapabilities+xml":{"source":"iana","compressible":true},"application/vnd.ms-printing.printticket+xml":{"source":"apache","compressible":true},"application/vnd.ms-printschematicket+xml":{"source":"iana","compressible":true},"application/vnd.ms-project":{"source":"iana","extensions":["mpp","mpt"]},"application/vnd.ms-tnef":{"source":"iana"},"application/vnd.ms-windows.devicepairing":{"source":"iana"},"application/vnd.ms-windows.nwprinting.oob":{"source":"iana"},"application/vnd.ms-windows.printerpairing":{"source":"iana"},"application/vnd.ms-windows.wsd.oob":{"source":"iana"},"application/vnd.ms-wmdrm.lic-chlg-req":{"source":"iana"},"application/vnd.ms-wmdrm.lic-resp":{"source":"iana"},"application/vnd.ms-wmdrm.meter-chlg-req":{"source":"iana"},"application/vnd.ms-wmdrm.meter-resp":{"source":"iana"},"application/vnd.ms-word.document.macroenabled.12":{"source":"iana","extensions":["docm"]},"application/vnd.ms-word.template.macroenabled.12":{"source":"iana","extensions":["dotm"]},"application/vnd.ms-works":{"source":"iana","extensions":["wps","wks","wcm","wdb"]},"application/vnd.ms-wpl":{"source":"iana","extensions":["wpl"]},"application/vnd.ms-xpsdocument":{"source":"iana","compressible":false,"extensions":["xps"]},"application/vnd.msa-disk-image":{"source":"iana"},"application/vnd.mseq":{"source":"iana","extensions":["mseq"]},"application/vnd.msign":{"source":"iana"},"application/vnd.multiad.creator":{"source":"iana"},"application/vnd.multiad.creator.cif":{"source":"iana"},"application/vnd.music-niff":{"source":"iana"},"application/vnd.musician":{"source":"iana","extensions":["mus"]},"application/vnd.muvee.style":{"source":"iana","extensions":["msty"]},"application/vnd.mynfc":{"source":"iana","extensions":["taglet"]},"application/vnd.nacamar.ybrid+json":{"source":"iana","compressible":true},"application/vnd.ncd.control":{"source":"iana"},"application/vnd.ncd.reference":{"source":"iana"},"application/vnd.nearst.inv+json":{"source":"iana","compressible":true},"application/vnd.nebumind.line":{"source":"iana"},"application/vnd.nervana":{"source":"iana"},"application/vnd.netfpx":{"source":"iana"},"application/vnd.neurolanguage.nlu":{"source":"iana","extensions":["nlu"]},"application/vnd.nimn":{"source":"iana"},"application/vnd.nintendo.nitro.rom":{"source":"iana"},"application/vnd.nintendo.snes.rom":{"source":"iana"},"application/vnd.nitf":{"source":"iana","extensions":["ntf","nitf"]},"application/vnd.noblenet-directory":{"source":"iana","extensions":["nnd"]},"application/vnd.noblenet-sealer":{"source":"iana","extensions":["nns"]},"application/vnd.noblenet-web":{"source":"iana","extensions":["nnw"]},"application/vnd.nokia.catalogs":{"source":"iana"},"application/vnd.nokia.conml+wbxml":{"source":"iana"},"application/vnd.nokia.conml+xml":{"source":"iana","compressible":true},"application/vnd.nokia.iptv.config+xml":{"source":"iana","compressible":true},"application/vnd.nokia.isds-radio-presets":{"source":"iana"},"application/vnd.nokia.landmark+wbxml":{"source":"iana"},"application/vnd.nokia.landmark+xml":{"source":"iana","compressible":true},"application/vnd.nokia.landmarkcollection+xml":{"source":"iana","compressible":true},"application/vnd.nokia.n-gage.ac+xml":{"source":"iana","compressible":true,"extensions":["ac"]},"application/vnd.nokia.n-gage.data":{"source":"iana","extensions":["ngdat"]},"application/vnd.nokia.n-gage.symbian.install":{"source":"apache","extensions":["n-gage"]},"application/vnd.nokia.ncd":{"source":"iana"},"application/vnd.nokia.pcd+wbxml":{"source":"iana"},"application/vnd.nokia.pcd+xml":{"source":"iana","compressible":true},"application/vnd.nokia.radio-preset":{"source":"iana","extensions":["rpst"]},"application/vnd.nokia.radio-presets":{"source":"iana","extensions":["rpss"]},"application/vnd.novadigm.edm":{"source":"iana","extensions":["edm"]},"application/vnd.novadigm.edx":{"source":"iana","extensions":["edx"]},"application/vnd.novadigm.ext":{"source":"iana","extensions":["ext"]},"application/vnd.ntt-local.content-share":{"source":"iana"},"application/vnd.ntt-local.file-transfer":{"source":"iana"},"application/vnd.ntt-local.ogw_remote-access":{"source":"iana"},"application/vnd.ntt-local.sip-ta_remote":{"source":"iana"},"application/vnd.ntt-local.sip-ta_tcp_stream":{"source":"iana"},"application/vnd.oasis.opendocument.chart":{"source":"iana","extensions":["odc"]},"application/vnd.oasis.opendocument.chart-template":{"source":"iana","extensions":["otc"]},"application/vnd.oasis.opendocument.database":{"source":"iana","extensions":["odb"]},"application/vnd.oasis.opendocument.formula":{"source":"iana","extensions":["odf"]},"application/vnd.oasis.opendocument.formula-template":{"source":"iana","extensions":["odft"]},"application/vnd.oasis.opendocument.graphics":{"source":"iana","compressible":false,"extensions":["odg"]},"application/vnd.oasis.opendocument.graphics-template":{"source":"iana","extensions":["otg"]},"application/vnd.oasis.opendocument.image":{"source":"iana","extensions":["odi"]},"application/vnd.oasis.opendocument.image-template":{"source":"iana","extensions":["oti"]},"application/vnd.oasis.opendocument.presentation":{"source":"iana","compressible":false,"extensions":["odp"]},"application/vnd.oasis.opendocument.presentation-template":{"source":"iana","extensions":["otp"]},"application/vnd.oasis.opendocument.spreadsheet":{"source":"iana","compressible":false,"extensions":["ods"]},"application/vnd.oasis.opendocument.spreadsheet-template":{"source":"iana","extensions":["ots"]},"application/vnd.oasis.opendocument.text":{"source":"iana","compressible":false,"extensions":["odt"]},"application/vnd.oasis.opendocument.text-master":{"source":"iana","extensions":["odm"]},"application/vnd.oasis.opendocument.text-template":{"source":"iana","extensions":["ott"]},"application/vnd.oasis.opendocument.text-web":{"source":"iana","extensions":["oth"]},"application/vnd.obn":{"source":"iana"},"application/vnd.ocf+cbor":{"source":"iana"},"application/vnd.oci.image.manifest.v1+json":{"source":"iana","compressible":true},"application/vnd.oftn.l10n+json":{"source":"iana","compressible":true},"application/vnd.oipf.contentaccessdownload+xml":{"source":"iana","compressible":true},"application/vnd.oipf.contentaccessstreaming+xml":{"source":"iana","compressible":true},"application/vnd.oipf.cspg-hexbinary":{"source":"iana"},"application/vnd.oipf.dae.svg+xml":{"source":"iana","compressible":true},"application/vnd.oipf.dae.xhtml+xml":{"source":"iana","compressible":true},"application/vnd.oipf.mippvcontrolmessage+xml":{"source":"iana","compressible":true},"application/vnd.oipf.pae.gem":{"source":"iana"},"application/vnd.oipf.spdiscovery+xml":{"source":"iana","compressible":true},"application/vnd.oipf.spdlist+xml":{"source":"iana","compressible":true},"application/vnd.oipf.ueprofile+xml":{"source":"iana","compressible":true},"application/vnd.oipf.userprofile+xml":{"source":"iana","compressible":true},"application/vnd.olpc-sugar":{"source":"iana","extensions":["xo"]},"application/vnd.oma-scws-config":{"source":"iana"},"application/vnd.oma-scws-http-request":{"source":"iana"},"application/vnd.oma-scws-http-response":{"source":"iana"},"application/vnd.oma.bcast.associated-procedure-parameter+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.drm-trigger+xml":{"source":"apache","compressible":true},"application/vnd.oma.bcast.imd+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.ltkm":{"source":"iana"},"application/vnd.oma.bcast.notification+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.provisioningtrigger":{"source":"iana"},"application/vnd.oma.bcast.sgboot":{"source":"iana"},"application/vnd.oma.bcast.sgdd+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.sgdu":{"source":"iana"},"application/vnd.oma.bcast.simple-symbol-container":{"source":"iana"},"application/vnd.oma.bcast.smartcard-trigger+xml":{"source":"apache","compressible":true},"application/vnd.oma.bcast.sprov+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.stkm":{"source":"iana"},"application/vnd.oma.cab-address-book+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-feature-handler+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-pcc+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-subs-invite+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-user-prefs+xml":{"source":"iana","compressible":true},"application/vnd.oma.dcd":{"source":"iana"},"application/vnd.oma.dcdc":{"source":"iana"},"application/vnd.oma.dd2+xml":{"source":"iana","compressible":true,"extensions":["dd2"]},"application/vnd.oma.drm.risd+xml":{"source":"iana","compressible":true},"application/vnd.oma.group-usage-list+xml":{"source":"iana","compressible":true},"application/vnd.oma.lwm2m+cbor":{"source":"iana"},"application/vnd.oma.lwm2m+json":{"source":"iana","compressible":true},"application/vnd.oma.lwm2m+tlv":{"source":"iana"},"application/vnd.oma.pal+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.detailed-progress-report+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.final-report+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.groups+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.invocation-descriptor+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.optimized-progress-report+xml":{"source":"iana","compressible":true},"application/vnd.oma.push":{"source":"iana"},"application/vnd.oma.scidm.messages+xml":{"source":"iana","compressible":true},"application/vnd.oma.xcap-directory+xml":{"source":"iana","compressible":true},"application/vnd.omads-email+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.omads-file+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.omads-folder+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.omaloc-supl-init":{"source":"iana"},"application/vnd.onepager":{"source":"iana"},"application/vnd.onepagertamp":{"source":"iana"},"application/vnd.onepagertamx":{"source":"iana"},"application/vnd.onepagertat":{"source":"iana"},"application/vnd.onepagertatp":{"source":"iana"},"application/vnd.onepagertatx":{"source":"iana"},"application/vnd.onvif.metadata":{"source":"iana"},"application/vnd.openblox.game+xml":{"source":"iana","compressible":true,"extensions":["obgx"]},"application/vnd.openblox.game-binary":{"source":"iana"},"application/vnd.openeye.oeb":{"source":"iana"},"application/vnd.openofficeorg.extension":{"source":"apache","extensions":["oxt"]},"application/vnd.openstreetmap.data+xml":{"source":"iana","compressible":true,"extensions":["osm"]},"application/vnd.opentimestamps.ots":{"source":"iana"},"application/vnd.openxmlformats-officedocument.custom-properties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.customxmlproperties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawing+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.chart+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.extended-properties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.comments+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.presentation":{"source":"iana","compressible":false,"extensions":["pptx"]},"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slide":{"source":"iana","extensions":["sldx"]},"application/vnd.openxmlformats-officedocument.presentationml.slide+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slideshow":{"source":"iana","extensions":["ppsx"]},"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.tags+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.template":{"source":"iana","extensions":["potx"]},"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":{"source":"iana","compressible":false,"extensions":["xlsx"]},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.template":{"source":"iana","extensions":["xltx"]},"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.theme+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.themeoverride+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.vmldrawing":{"source":"iana"},"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.document":{"source":"iana","compressible":false,"extensions":["docx"]},"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.template":{"source":"iana","extensions":["dotx"]},"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-package.core-properties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-package.relationships+xml":{"source":"iana","compressible":true},"application/vnd.oracle.resource+json":{"source":"iana","compressible":true},"application/vnd.orange.indata":{"source":"iana"},"application/vnd.osa.netdeploy":{"source":"iana"},"application/vnd.osgeo.mapguide.package":{"source":"iana","extensions":["mgp"]},"application/vnd.osgi.bundle":{"source":"iana"},"application/vnd.osgi.dp":{"source":"iana","extensions":["dp"]},"application/vnd.osgi.subsystem":{"source":"iana","extensions":["esa"]},"application/vnd.otps.ct-kip+xml":{"source":"iana","compressible":true},"application/vnd.oxli.countgraph":{"source":"iana"},"application/vnd.pagerduty+json":{"source":"iana","compressible":true},"application/vnd.palm":{"source":"iana","extensions":["pdb","pqa","oprc"]},"application/vnd.panoply":{"source":"iana"},"application/vnd.paos.xml":{"source":"iana"},"application/vnd.patentdive":{"source":"iana"},"application/vnd.patientecommsdoc":{"source":"iana"},"application/vnd.pawaafile":{"source":"iana","extensions":["paw"]},"application/vnd.pcos":{"source":"iana"},"application/vnd.pg.format":{"source":"iana","extensions":["str"]},"application/vnd.pg.osasli":{"source":"iana","extensions":["ei6"]},"application/vnd.piaccess.application-licence":{"source":"iana"},"application/vnd.picsel":{"source":"iana","extensions":["efif"]},"application/vnd.pmi.widget":{"source":"iana","extensions":["wg"]},"application/vnd.poc.group-advertisement+xml":{"source":"iana","compressible":true},"application/vnd.pocketlearn":{"source":"iana","extensions":["plf"]},"application/vnd.powerbuilder6":{"source":"iana","extensions":["pbd"]},"application/vnd.powerbuilder6-s":{"source":"iana"},"application/vnd.powerbuilder7":{"source":"iana"},"application/vnd.powerbuilder7-s":{"source":"iana"},"application/vnd.powerbuilder75":{"source":"iana"},"application/vnd.powerbuilder75-s":{"source":"iana"},"application/vnd.preminet":{"source":"iana"},"application/vnd.previewsystems.box":{"source":"iana","extensions":["box"]},"application/vnd.proteus.magazine":{"source":"iana","extensions":["mgz"]},"application/vnd.psfs":{"source":"iana"},"application/vnd.publishare-delta-tree":{"source":"iana","extensions":["qps"]},"application/vnd.pvi.ptid1":{"source":"iana","extensions":["ptid"]},"application/vnd.pwg-multiplexed":{"source":"iana"},"application/vnd.pwg-xhtml-print+xml":{"source":"iana","compressible":true,"extensions":["xhtm"]},"application/vnd.qualcomm.brew-app-res":{"source":"iana"},"application/vnd.quarantainenet":{"source":"iana"},"application/vnd.quark.quarkxpress":{"source":"iana","extensions":["qxd","qxt","qwd","qwt","qxl","qxb"]},"application/vnd.quobject-quoxdocument":{"source":"iana"},"application/vnd.radisys.moml+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-conf+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-conn+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-dialog+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-stream+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-conf+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-base+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-fax-detect+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-fax-sendrecv+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-group+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-speech+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-transform+xml":{"source":"iana","compressible":true},"application/vnd.rainstor.data":{"source":"iana"},"application/vnd.rapid":{"source":"iana"},"application/vnd.rar":{"source":"iana","extensions":["rar"]},"application/vnd.realvnc.bed":{"source":"iana","extensions":["bed"]},"application/vnd.recordare.musicxml":{"source":"iana","extensions":["mxl"]},"application/vnd.recordare.musicxml+xml":{"source":"iana","compressible":true,"extensions":["musicxml"]},"application/vnd.renlearn.rlprint":{"source":"iana"},"application/vnd.resilient.logic":{"source":"iana"},"application/vnd.restful+json":{"source":"iana","compressible":true},"application/vnd.rig.cryptonote":{"source":"iana","extensions":["cryptonote"]},"application/vnd.rim.cod":{"source":"apache","extensions":["cod"]},"application/vnd.rn-realmedia":{"source":"apache","extensions":["rm"]},"application/vnd.rn-realmedia-vbr":{"source":"apache","extensions":["rmvb"]},"application/vnd.route66.link66+xml":{"source":"iana","compressible":true,"extensions":["link66"]},"application/vnd.rs-274x":{"source":"iana"},"application/vnd.ruckus.download":{"source":"iana"},"application/vnd.s3sms":{"source":"iana"},"application/vnd.sailingtracker.track":{"source":"iana","extensions":["st"]},"application/vnd.sar":{"source":"iana"},"application/vnd.sbm.cid":{"source":"iana"},"application/vnd.sbm.mid2":{"source":"iana"},"application/vnd.scribus":{"source":"iana"},"application/vnd.sealed.3df":{"source":"iana"},"application/vnd.sealed.csf":{"source":"iana"},"application/vnd.sealed.doc":{"source":"iana"},"application/vnd.sealed.eml":{"source":"iana"},"application/vnd.sealed.mht":{"source":"iana"},"application/vnd.sealed.net":{"source":"iana"},"application/vnd.sealed.ppt":{"source":"iana"},"application/vnd.sealed.tiff":{"source":"iana"},"application/vnd.sealed.xls":{"source":"iana"},"application/vnd.sealedmedia.softseal.html":{"source":"iana"},"application/vnd.sealedmedia.softseal.pdf":{"source":"iana"},"application/vnd.seemail":{"source":"iana","extensions":["see"]},"application/vnd.seis+json":{"source":"iana","compressible":true},"application/vnd.sema":{"source":"iana","extensions":["sema"]},"application/vnd.semd":{"source":"iana","extensions":["semd"]},"application/vnd.semf":{"source":"iana","extensions":["semf"]},"application/vnd.shade-save-file":{"source":"iana"},"application/vnd.shana.informed.formdata":{"source":"iana","extensions":["ifm"]},"application/vnd.shana.informed.formtemplate":{"source":"iana","extensions":["itp"]},"application/vnd.shana.informed.interchange":{"source":"iana","extensions":["iif"]},"application/vnd.shana.informed.package":{"source":"iana","extensions":["ipk"]},"application/vnd.shootproof+json":{"source":"iana","compressible":true},"application/vnd.shopkick+json":{"source":"iana","compressible":true},"application/vnd.shp":{"source":"iana"},"application/vnd.shx":{"source":"iana"},"application/vnd.sigrok.session":{"source":"iana"},"application/vnd.simtech-mindmapper":{"source":"iana","extensions":["twd","twds"]},"application/vnd.siren+json":{"source":"iana","compressible":true},"application/vnd.smaf":{"source":"iana","extensions":["mmf"]},"application/vnd.smart.notebook":{"source":"iana"},"application/vnd.smart.teacher":{"source":"iana","extensions":["teacher"]},"application/vnd.snesdev-page-table":{"source":"iana"},"application/vnd.software602.filler.form+xml":{"source":"iana","compressible":true,"extensions":["fo"]},"application/vnd.software602.filler.form-xml-zip":{"source":"iana"},"application/vnd.solent.sdkm+xml":{"source":"iana","compressible":true,"extensions":["sdkm","sdkd"]},"application/vnd.spotfire.dxp":{"source":"iana","extensions":["dxp"]},"application/vnd.spotfire.sfs":{"source":"iana","extensions":["sfs"]},"application/vnd.sqlite3":{"source":"iana"},"application/vnd.sss-cod":{"source":"iana"},"application/vnd.sss-dtf":{"source":"iana"},"application/vnd.sss-ntf":{"source":"iana"},"application/vnd.stardivision.calc":{"source":"apache","extensions":["sdc"]},"application/vnd.stardivision.draw":{"source":"apache","extensions":["sda"]},"application/vnd.stardivision.impress":{"source":"apache","extensions":["sdd"]},"application/vnd.stardivision.math":{"source":"apache","extensions":["smf"]},"application/vnd.stardivision.writer":{"source":"apache","extensions":["sdw","vor"]},"application/vnd.stardivision.writer-global":{"source":"apache","extensions":["sgl"]},"application/vnd.stepmania.package":{"source":"iana","extensions":["smzip"]},"application/vnd.stepmania.stepchart":{"source":"iana","extensions":["sm"]},"application/vnd.street-stream":{"source":"iana"},"application/vnd.sun.wadl+xml":{"source":"iana","compressible":true,"extensions":["wadl"]},"application/vnd.sun.xml.calc":{"source":"apache","extensions":["sxc"]},"application/vnd.sun.xml.calc.template":{"source":"apache","extensions":["stc"]},"application/vnd.sun.xml.draw":{"source":"apache","extensions":["sxd"]},"application/vnd.sun.xml.draw.template":{"source":"apache","extensions":["std"]},"application/vnd.sun.xml.impress":{"source":"apache","extensions":["sxi"]},"application/vnd.sun.xml.impress.template":{"source":"apache","extensions":["sti"]},"application/vnd.sun.xml.math":{"source":"apache","extensions":["sxm"]},"application/vnd.sun.xml.writer":{"source":"apache","extensions":["sxw"]},"application/vnd.sun.xml.writer.global":{"source":"apache","extensions":["sxg"]},"application/vnd.sun.xml.writer.template":{"source":"apache","extensions":["stw"]},"application/vnd.sus-calendar":{"source":"iana","extensions":["sus","susp"]},"application/vnd.svd":{"source":"iana","extensions":["svd"]},"application/vnd.swiftview-ics":{"source":"iana"},"application/vnd.sycle+xml":{"source":"iana","compressible":true},"application/vnd.syft+json":{"source":"iana","compressible":true},"application/vnd.symbian.install":{"source":"apache","extensions":["sis","sisx"]},"application/vnd.syncml+xml":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["xsm"]},"application/vnd.syncml.dm+wbxml":{"source":"iana","charset":"UTF-8","extensions":["bdm"]},"application/vnd.syncml.dm+xml":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["xdm"]},"application/vnd.syncml.dm.notification":{"source":"iana"},"application/vnd.syncml.dmddf+wbxml":{"source":"iana"},"application/vnd.syncml.dmddf+xml":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["ddf"]},"application/vnd.syncml.dmtnds+wbxml":{"source":"iana"},"application/vnd.syncml.dmtnds+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.syncml.ds.notification":{"source":"iana"},"application/vnd.tableschema+json":{"source":"iana","compressible":true},"application/vnd.tao.intent-module-archive":{"source":"iana","extensions":["tao"]},"application/vnd.tcpdump.pcap":{"source":"iana","extensions":["pcap","cap","dmp"]},"application/vnd.think-cell.ppttc+json":{"source":"iana","compressible":true},"application/vnd.tmd.mediaflex.api+xml":{"source":"iana","compressible":true},"application/vnd.tml":{"source":"iana"},"application/vnd.tmobile-livetv":{"source":"iana","extensions":["tmo"]},"application/vnd.tri.onesource":{"source":"iana"},"application/vnd.trid.tpt":{"source":"iana","extensions":["tpt"]},"application/vnd.triscape.mxs":{"source":"iana","extensions":["mxs"]},"application/vnd.trueapp":{"source":"iana","extensions":["tra"]},"application/vnd.truedoc":{"source":"iana"},"application/vnd.ubisoft.webplayer":{"source":"iana"},"application/vnd.ufdl":{"source":"iana","extensions":["ufd","ufdl"]},"application/vnd.uiq.theme":{"source":"iana","extensions":["utz"]},"application/vnd.umajin":{"source":"iana","extensions":["umj"]},"application/vnd.unity":{"source":"iana","extensions":["unityweb"]},"application/vnd.uoml+xml":{"source":"iana","compressible":true,"extensions":["uoml","uo"]},"application/vnd.uplanet.alert":{"source":"iana"},"application/vnd.uplanet.alert-wbxml":{"source":"iana"},"application/vnd.uplanet.bearer-choice":{"source":"iana"},"application/vnd.uplanet.bearer-choice-wbxml":{"source":"iana"},"application/vnd.uplanet.cacheop":{"source":"iana"},"application/vnd.uplanet.cacheop-wbxml":{"source":"iana"},"application/vnd.uplanet.channel":{"source":"iana"},"application/vnd.uplanet.channel-wbxml":{"source":"iana"},"application/vnd.uplanet.list":{"source":"iana"},"application/vnd.uplanet.list-wbxml":{"source":"iana"},"application/vnd.uplanet.listcmd":{"source":"iana"},"application/vnd.uplanet.listcmd-wbxml":{"source":"iana"},"application/vnd.uplanet.signal":{"source":"iana"},"application/vnd.uri-map":{"source":"iana"},"application/vnd.valve.source.material":{"source":"iana"},"application/vnd.vcx":{"source":"iana","extensions":["vcx"]},"application/vnd.vd-study":{"source":"iana"},"application/vnd.vectorworks":{"source":"iana"},"application/vnd.vel+json":{"source":"iana","compressible":true},"application/vnd.verimatrix.vcas":{"source":"iana"},"application/vnd.veritone.aion+json":{"source":"iana","compressible":true},"application/vnd.veryant.thin":{"source":"iana"},"application/vnd.ves.encrypted":{"source":"iana"},"application/vnd.vidsoft.vidconference":{"source":"iana"},"application/vnd.visio":{"source":"iana","extensions":["vsd","vst","vss","vsw"]},"application/vnd.visionary":{"source":"iana","extensions":["vis"]},"application/vnd.vividence.scriptfile":{"source":"iana"},"application/vnd.vsf":{"source":"iana","extensions":["vsf"]},"application/vnd.wap.sic":{"source":"iana"},"application/vnd.wap.slc":{"source":"iana"},"application/vnd.wap.wbxml":{"source":"iana","charset":"UTF-8","extensions":["wbxml"]},"application/vnd.wap.wmlc":{"source":"iana","extensions":["wmlc"]},"application/vnd.wap.wmlscriptc":{"source":"iana","extensions":["wmlsc"]},"application/vnd.webturbo":{"source":"iana","extensions":["wtb"]},"application/vnd.wfa.dpp":{"source":"iana"},"application/vnd.wfa.p2p":{"source":"iana"},"application/vnd.wfa.wsc":{"source":"iana"},"application/vnd.windows.devicepairing":{"source":"iana"},"application/vnd.wmc":{"source":"iana"},"application/vnd.wmf.bootstrap":{"source":"iana"},"application/vnd.wolfram.mathematica":{"source":"iana"},"application/vnd.wolfram.mathematica.package":{"source":"iana"},"application/vnd.wolfram.player":{"source":"iana","extensions":["nbp"]},"application/vnd.wordperfect":{"source":"iana","extensions":["wpd"]},"application/vnd.wqd":{"source":"iana","extensions":["wqd"]},"application/vnd.wrq-hp3000-labelled":{"source":"iana"},"application/vnd.wt.stf":{"source":"iana","extensions":["stf"]},"application/vnd.wv.csp+wbxml":{"source":"iana"},"application/vnd.wv.csp+xml":{"source":"iana","compressible":true},"application/vnd.wv.ssp+xml":{"source":"iana","compressible":true},"application/vnd.xacml+json":{"source":"iana","compressible":true},"application/vnd.xara":{"source":"iana","extensions":["xar"]},"application/vnd.xfdl":{"source":"iana","extensions":["xfdl"]},"application/vnd.xfdl.webform":{"source":"iana"},"application/vnd.xmi+xml":{"source":"iana","compressible":true},"application/vnd.xmpie.cpkg":{"source":"iana"},"application/vnd.xmpie.dpkg":{"source":"iana"},"application/vnd.xmpie.plan":{"source":"iana"},"application/vnd.xmpie.ppkg":{"source":"iana"},"application/vnd.xmpie.xlim":{"source":"iana"},"application/vnd.yamaha.hv-dic":{"source":"iana","extensions":["hvd"]},"application/vnd.yamaha.hv-script":{"source":"iana","extensions":["hvs"]},"application/vnd.yamaha.hv-voice":{"source":"iana","extensions":["hvp"]},"application/vnd.yamaha.openscoreformat":{"source":"iana","extensions":["osf"]},"application/vnd.yamaha.openscoreformat.osfpvg+xml":{"source":"iana","compressible":true,"extensions":["osfpvg"]},"application/vnd.yamaha.remote-setup":{"source":"iana"},"application/vnd.yamaha.smaf-audio":{"source":"iana","extensions":["saf"]},"application/vnd.yamaha.smaf-phrase":{"source":"iana","extensions":["spf"]},"application/vnd.yamaha.through-ngn":{"source":"iana"},"application/vnd.yamaha.tunnel-udpencap":{"source":"iana"},"application/vnd.yaoweme":{"source":"iana"},"application/vnd.yellowriver-custom-menu":{"source":"iana","extensions":["cmp"]},"application/vnd.zul":{"source":"iana","extensions":["zir","zirz"]},"application/vnd.zzazz.deck+xml":{"source":"iana","compressible":true,"extensions":["zaz"]},"application/voicexml+xml":{"source":"iana","compressible":true,"extensions":["vxml"]},"application/voucher-cms+json":{"source":"iana","compressible":true},"application/vq-rtcpxr":{"source":"iana"},"application/wasm":{"source":"iana","compressible":true,"extensions":["wasm"]},"application/watcherinfo+xml":{"source":"iana","compressible":true,"extensions":["wif"]},"application/webpush-options+json":{"source":"iana","compressible":true},"application/whoispp-query":{"source":"iana"},"application/whoispp-response":{"source":"iana"},"application/widget":{"source":"iana","extensions":["wgt"]},"application/winhlp":{"source":"apache","extensions":["hlp"]},"application/wita":{"source":"iana"},"application/wordperfect5.1":{"source":"iana"},"application/wsdl+xml":{"source":"iana","compressible":true,"extensions":["wsdl"]},"application/wspolicy+xml":{"source":"iana","compressible":true,"extensions":["wspolicy"]},"application/x-7z-compressed":{"source":"apache","compressible":false,"extensions":["7z"]},"application/x-abiword":{"source":"apache","extensions":["abw"]},"application/x-ace-compressed":{"source":"apache","extensions":["ace"]},"application/x-amf":{"source":"apache"},"application/x-apple-diskimage":{"source":"apache","extensions":["dmg"]},"application/x-arj":{"compressible":false,"extensions":["arj"]},"application/x-authorware-bin":{"source":"apache","extensions":["aab","x32","u32","vox"]},"application/x-authorware-map":{"source":"apache","extensions":["aam"]},"application/x-authorware-seg":{"source":"apache","extensions":["aas"]},"application/x-bcpio":{"source":"apache","extensions":["bcpio"]},"application/x-bdoc":{"compressible":false,"extensions":["bdoc"]},"application/x-bittorrent":{"source":"apache","extensions":["torrent"]},"application/x-blorb":{"source":"apache","extensions":["blb","blorb"]},"application/x-bzip":{"source":"apache","compressible":false,"extensions":["bz"]},"application/x-bzip2":{"source":"apache","compressible":false,"extensions":["bz2","boz"]},"application/x-cbr":{"source":"apache","extensions":["cbr","cba","cbt","cbz","cb7"]},"application/x-cdlink":{"source":"apache","extensions":["vcd"]},"application/x-cfs-compressed":{"source":"apache","extensions":["cfs"]},"application/x-chat":{"source":"apache","extensions":["chat"]},"application/x-chess-pgn":{"source":"apache","extensions":["pgn"]},"application/x-chrome-extension":{"extensions":["crx"]},"application/x-cocoa":{"source":"nginx","extensions":["cco"]},"application/x-compress":{"source":"apache"},"application/x-conference":{"source":"apache","extensions":["nsc"]},"application/x-cpio":{"source":"apache","extensions":["cpio"]},"application/x-csh":{"source":"apache","extensions":["csh"]},"application/x-deb":{"compressible":false},"application/x-debian-package":{"source":"apache","extensions":["deb","udeb"]},"application/x-dgc-compressed":{"source":"apache","extensions":["dgc"]},"application/x-director":{"source":"apache","extensions":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"]},"application/x-doom":{"source":"apache","extensions":["wad"]},"application/x-dtbncx+xml":{"source":"apache","compressible":true,"extensions":["ncx"]},"application/x-dtbook+xml":{"source":"apache","compressible":true,"extensions":["dtb"]},"application/x-dtbresource+xml":{"source":"apache","compressible":true,"extensions":["res"]},"application/x-dvi":{"source":"apache","compressible":false,"extensions":["dvi"]},"application/x-envoy":{"source":"apache","extensions":["evy"]},"application/x-eva":{"source":"apache","extensions":["eva"]},"application/x-font-bdf":{"source":"apache","extensions":["bdf"]},"application/x-font-dos":{"source":"apache"},"application/x-font-framemaker":{"source":"apache"},"application/x-font-ghostscript":{"source":"apache","extensions":["gsf"]},"application/x-font-libgrx":{"source":"apache"},"application/x-font-linux-psf":{"source":"apache","extensions":["psf"]},"application/x-font-pcf":{"source":"apache","extensions":["pcf"]},"application/x-font-snf":{"source":"apache","extensions":["snf"]},"application/x-font-speedo":{"source":"apache"},"application/x-font-sunos-news":{"source":"apache"},"application/x-font-type1":{"source":"apache","extensions":["pfa","pfb","pfm","afm"]},"application/x-font-vfont":{"source":"apache"},"application/x-freearc":{"source":"apache","extensions":["arc"]},"application/x-futuresplash":{"source":"apache","extensions":["spl"]},"application/x-gca-compressed":{"source":"apache","extensions":["gca"]},"application/x-glulx":{"source":"apache","extensions":["ulx"]},"application/x-gnumeric":{"source":"apache","extensions":["gnumeric"]},"application/x-gramps-xml":{"source":"apache","extensions":["gramps"]},"application/x-gtar":{"source":"apache","extensions":["gtar"]},"application/x-gzip":{"source":"apache"},"application/x-hdf":{"source":"apache","extensions":["hdf"]},"application/x-httpd-php":{"compressible":true,"extensions":["php"]},"application/x-install-instructions":{"source":"apache","extensions":["install"]},"application/x-iso9660-image":{"source":"apache","extensions":["iso"]},"application/x-iwork-keynote-sffkey":{"extensions":["key"]},"application/x-iwork-numbers-sffnumbers":{"extensions":["numbers"]},"application/x-iwork-pages-sffpages":{"extensions":["pages"]},"application/x-java-archive-diff":{"source":"nginx","extensions":["jardiff"]},"application/x-java-jnlp-file":{"source":"apache","compressible":false,"extensions":["jnlp"]},"application/x-javascript":{"compressible":true},"application/x-keepass2":{"extensions":["kdbx"]},"application/x-latex":{"source":"apache","compressible":false,"extensions":["latex"]},"application/x-lua-bytecode":{"extensions":["luac"]},"application/x-lzh-compressed":{"source":"apache","extensions":["lzh","lha"]},"application/x-makeself":{"source":"nginx","extensions":["run"]},"application/x-mie":{"source":"apache","extensions":["mie"]},"application/x-mobipocket-ebook":{"source":"apache","extensions":["prc","mobi"]},"application/x-mpegurl":{"compressible":false},"application/x-ms-application":{"source":"apache","extensions":["application"]},"application/x-ms-shortcut":{"source":"apache","extensions":["lnk"]},"application/x-ms-wmd":{"source":"apache","extensions":["wmd"]},"application/x-ms-wmz":{"source":"apache","extensions":["wmz"]},"application/x-ms-xbap":{"source":"apache","extensions":["xbap"]},"application/x-msaccess":{"source":"apache","extensions":["mdb"]},"application/x-msbinder":{"source":"apache","extensions":["obd"]},"application/x-mscardfile":{"source":"apache","extensions":["crd"]},"application/x-msclip":{"source":"apache","extensions":["clp"]},"application/x-msdos-program":{"extensions":["exe"]},"application/x-msdownload":{"source":"apache","extensions":["exe","dll","com","bat","msi"]},"application/x-msmediaview":{"source":"apache","extensions":["mvb","m13","m14"]},"application/x-msmetafile":{"source":"apache","extensions":["wmf","wmz","emf","emz"]},"application/x-msmoney":{"source":"apache","extensions":["mny"]},"application/x-mspublisher":{"source":"apache","extensions":["pub"]},"application/x-msschedule":{"source":"apache","extensions":["scd"]},"application/x-msterminal":{"source":"apache","extensions":["trm"]},"application/x-mswrite":{"source":"apache","extensions":["wri"]},"application/x-netcdf":{"source":"apache","extensions":["nc","cdf"]},"application/x-ns-proxy-autoconfig":{"compressible":true,"extensions":["pac"]},"application/x-nzb":{"source":"apache","extensions":["nzb"]},"application/x-perl":{"source":"nginx","extensions":["pl","pm"]},"application/x-pilot":{"source":"nginx","extensions":["prc","pdb"]},"application/x-pkcs12":{"source":"apache","compressible":false,"extensions":["p12","pfx"]},"application/x-pkcs7-certificates":{"source":"apache","extensions":["p7b","spc"]},"application/x-pkcs7-certreqresp":{"source":"apache","extensions":["p7r"]},"application/x-pki-message":{"source":"iana"},"application/x-rar-compressed":{"source":"apache","compressible":false,"extensions":["rar"]},"application/x-redhat-package-manager":{"source":"nginx","extensions":["rpm"]},"application/x-research-info-systems":{"source":"apache","extensions":["ris"]},"application/x-sea":{"source":"nginx","extensions":["sea"]},"application/x-sh":{"source":"apache","compressible":true,"extensions":["sh"]},"application/x-shar":{"source":"apache","extensions":["shar"]},"application/x-shockwave-flash":{"source":"apache","compressible":false,"extensions":["swf"]},"application/x-silverlight-app":{"source":"apache","extensions":["xap"]},"application/x-sql":{"source":"apache","extensions":["sql"]},"application/x-stuffit":{"source":"apache","compressible":false,"extensions":["sit"]},"application/x-stuffitx":{"source":"apache","extensions":["sitx"]},"application/x-subrip":{"source":"apache","extensions":["srt"]},"application/x-sv4cpio":{"source":"apache","extensions":["sv4cpio"]},"application/x-sv4crc":{"source":"apache","extensions":["sv4crc"]},"application/x-t3vm-image":{"source":"apache","extensions":["t3"]},"application/x-tads":{"source":"apache","extensions":["gam"]},"application/x-tar":{"source":"apache","compressible":true,"extensions":["tar"]},"application/x-tcl":{"source":"apache","extensions":["tcl","tk"]},"application/x-tex":{"source":"apache","extensions":["tex"]},"application/x-tex-tfm":{"source":"apache","extensions":["tfm"]},"application/x-texinfo":{"source":"apache","extensions":["texinfo","texi"]},"application/x-tgif":{"source":"apache","extensions":["obj"]},"application/x-ustar":{"source":"apache","extensions":["ustar"]},"application/x-virtualbox-hdd":{"compressible":true,"extensions":["hdd"]},"application/x-virtualbox-ova":{"compressible":true,"extensions":["ova"]},"application/x-virtualbox-ovf":{"compressible":true,"extensions":["ovf"]},"application/x-virtualbox-vbox":{"compressible":true,"extensions":["vbox"]},"application/x-virtualbox-vbox-extpack":{"compressible":false,"extensions":["vbox-extpack"]},"application/x-virtualbox-vdi":{"compressible":true,"extensions":["vdi"]},"application/x-virtualbox-vhd":{"compressible":true,"extensions":["vhd"]},"application/x-virtualbox-vmdk":{"compressible":true,"extensions":["vmdk"]},"application/x-wais-source":{"source":"apache","extensions":["src"]},"application/x-web-app-manifest+json":{"compressible":true,"extensions":["webapp"]},"application/x-www-form-urlencoded":{"source":"iana","compressible":true},"application/x-x509-ca-cert":{"source":"iana","extensions":["der","crt","pem"]},"application/x-x509-ca-ra-cert":{"source":"iana"},"application/x-x509-next-ca-cert":{"source":"iana"},"application/x-xfig":{"source":"apache","extensions":["fig"]},"application/x-xliff+xml":{"source":"apache","compressible":true,"extensions":["xlf"]},"application/x-xpinstall":{"source":"apache","compressible":false,"extensions":["xpi"]},"application/x-xz":{"source":"apache","extensions":["xz"]},"application/x-zmachine":{"source":"apache","extensions":["z1","z2","z3","z4","z5","z6","z7","z8"]},"application/x400-bp":{"source":"iana"},"application/xacml+xml":{"source":"iana","compressible":true},"application/xaml+xml":{"source":"apache","compressible":true,"extensions":["xaml"]},"application/xcap-att+xml":{"source":"iana","compressible":true,"extensions":["xav"]},"application/xcap-caps+xml":{"source":"iana","compressible":true,"extensions":["xca"]},"application/xcap-diff+xml":{"source":"iana","compressible":true,"extensions":["xdf"]},"application/xcap-el+xml":{"source":"iana","compressible":true,"extensions":["xel"]},"application/xcap-error+xml":{"source":"iana","compressible":true},"application/xcap-ns+xml":{"source":"iana","compressible":true,"extensions":["xns"]},"application/xcon-conference-info+xml":{"source":"iana","compressible":true},"application/xcon-conference-info-diff+xml":{"source":"iana","compressible":true},"application/xenc+xml":{"source":"iana","compressible":true,"extensions":["xenc"]},"application/xfdf":{"source":"iana","extensions":["xfdf"]},"application/xhtml+xml":{"source":"iana","compressible":true,"extensions":["xhtml","xht"]},"application/xhtml-voice+xml":{"source":"apache","compressible":true},"application/xliff+xml":{"source":"iana","compressible":true,"extensions":["xlf"]},"application/xml":{"source":"iana","compressible":true,"extensions":["xml","xsl","xsd","rng"]},"application/xml-dtd":{"source":"iana","compressible":true,"extensions":["dtd"]},"application/xml-external-parsed-entity":{"source":"iana"},"application/xml-patch+xml":{"source":"iana","compressible":true},"application/xmpp+xml":{"source":"iana","compressible":true},"application/xop+xml":{"source":"iana","compressible":true,"extensions":["xop"]},"application/xproc+xml":{"source":"apache","compressible":true,"extensions":["xpl"]},"application/xslt+xml":{"source":"iana","compressible":true,"extensions":["xsl","xslt"]},"application/xspf+xml":{"source":"apache","compressible":true,"extensions":["xspf"]},"application/xv+xml":{"source":"iana","compressible":true,"extensions":["mxml","xhvml","xvml","xvm"]},"application/yang":{"source":"iana","extensions":["yang"]},"application/yang-data+cbor":{"source":"iana"},"application/yang-data+json":{"source":"iana","compressible":true},"application/yang-data+xml":{"source":"iana","compressible":true},"application/yang-patch+json":{"source":"iana","compressible":true},"application/yang-patch+xml":{"source":"iana","compressible":true},"application/yin+xml":{"source":"iana","compressible":true,"extensions":["yin"]},"application/zip":{"source":"iana","compressible":false,"extensions":["zip"]},"application/zlib":{"source":"iana"},"application/zstd":{"source":"iana"},"audio/1d-interleaved-parityfec":{"source":"iana"},"audio/32kadpcm":{"source":"iana"},"audio/3gpp":{"source":"iana","compressible":false,"extensions":["3gpp"]},"audio/3gpp2":{"source":"iana"},"audio/aac":{"source":"iana","extensions":["adts","aac"]},"audio/ac3":{"source":"iana"},"audio/adpcm":{"source":"apache","extensions":["adp"]},"audio/amr":{"source":"iana","extensions":["amr"]},"audio/amr-wb":{"source":"iana"},"audio/amr-wb+":{"source":"iana"},"audio/aptx":{"source":"iana"},"audio/asc":{"source":"iana"},"audio/atrac-advanced-lossless":{"source":"iana"},"audio/atrac-x":{"source":"iana"},"audio/atrac3":{"source":"iana"},"audio/basic":{"source":"iana","compressible":false,"extensions":["au","snd"]},"audio/bv16":{"source":"iana"},"audio/bv32":{"source":"iana"},"audio/clearmode":{"source":"iana"},"audio/cn":{"source":"iana"},"audio/dat12":{"source":"iana"},"audio/dls":{"source":"iana"},"audio/dsr-es201108":{"source":"iana"},"audio/dsr-es202050":{"source":"iana"},"audio/dsr-es202211":{"source":"iana"},"audio/dsr-es202212":{"source":"iana"},"audio/dv":{"source":"iana"},"audio/dvi4":{"source":"iana"},"audio/eac3":{"source":"iana"},"audio/encaprtp":{"source":"iana"},"audio/evrc":{"source":"iana"},"audio/evrc-qcp":{"source":"iana"},"audio/evrc0":{"source":"iana"},"audio/evrc1":{"source":"iana"},"audio/evrcb":{"source":"iana"},"audio/evrcb0":{"source":"iana"},"audio/evrcb1":{"source":"iana"},"audio/evrcnw":{"source":"iana"},"audio/evrcnw0":{"source":"iana"},"audio/evrcnw1":{"source":"iana"},"audio/evrcwb":{"source":"iana"},"audio/evrcwb0":{"source":"iana"},"audio/evrcwb1":{"source":"iana"},"audio/evs":{"source":"iana"},"audio/flexfec":{"source":"iana"},"audio/fwdred":{"source":"iana"},"audio/g711-0":{"source":"iana"},"audio/g719":{"source":"iana"},"audio/g722":{"source":"iana"},"audio/g7221":{"source":"iana"},"audio/g723":{"source":"iana"},"audio/g726-16":{"source":"iana"},"audio/g726-24":{"source":"iana"},"audio/g726-32":{"source":"iana"},"audio/g726-40":{"source":"iana"},"audio/g728":{"source":"iana"},"audio/g729":{"source":"iana"},"audio/g7291":{"source":"iana"},"audio/g729d":{"source":"iana"},"audio/g729e":{"source":"iana"},"audio/gsm":{"source":"iana"},"audio/gsm-efr":{"source":"iana"},"audio/gsm-hr-08":{"source":"iana"},"audio/ilbc":{"source":"iana"},"audio/ip-mr_v2.5":{"source":"iana"},"audio/isac":{"source":"apache"},"audio/l16":{"source":"iana"},"audio/l20":{"source":"iana"},"audio/l24":{"source":"iana","compressible":false},"audio/l8":{"source":"iana"},"audio/lpc":{"source":"iana"},"audio/melp":{"source":"iana"},"audio/melp1200":{"source":"iana"},"audio/melp2400":{"source":"iana"},"audio/melp600":{"source":"iana"},"audio/mhas":{"source":"iana"},"audio/midi":{"source":"apache","extensions":["mid","midi","kar","rmi"]},"audio/mobile-xmf":{"source":"iana","extensions":["mxmf"]},"audio/mp3":{"compressible":false,"extensions":["mp3"]},"audio/mp4":{"source":"iana","compressible":false,"extensions":["m4a","mp4a"]},"audio/mp4a-latm":{"source":"iana"},"audio/mpa":{"source":"iana"},"audio/mpa-robust":{"source":"iana"},"audio/mpeg":{"source":"iana","compressible":false,"extensions":["mpga","mp2","mp2a","mp3","m2a","m3a"]},"audio/mpeg4-generic":{"source":"iana"},"audio/musepack":{"source":"apache"},"audio/ogg":{"source":"iana","compressible":false,"extensions":["oga","ogg","spx","opus"]},"audio/opus":{"source":"iana"},"audio/parityfec":{"source":"iana"},"audio/pcma":{"source":"iana"},"audio/pcma-wb":{"source":"iana"},"audio/pcmu":{"source":"iana"},"audio/pcmu-wb":{"source":"iana"},"audio/prs.sid":{"source":"iana"},"audio/qcelp":{"source":"iana"},"audio/raptorfec":{"source":"iana"},"audio/red":{"source":"iana"},"audio/rtp-enc-aescm128":{"source":"iana"},"audio/rtp-midi":{"source":"iana"},"audio/rtploopback":{"source":"iana"},"audio/rtx":{"source":"iana"},"audio/s3m":{"source":"apache","extensions":["s3m"]},"audio/scip":{"source":"iana"},"audio/silk":{"source":"apache","extensions":["sil"]},"audio/smv":{"source":"iana"},"audio/smv-qcp":{"source":"iana"},"audio/smv0":{"source":"iana"},"audio/sofa":{"source":"iana"},"audio/sp-midi":{"source":"iana"},"audio/speex":{"source":"iana"},"audio/t140c":{"source":"iana"},"audio/t38":{"source":"iana"},"audio/telephone-event":{"source":"iana"},"audio/tetra_acelp":{"source":"iana"},"audio/tetra_acelp_bb":{"source":"iana"},"audio/tone":{"source":"iana"},"audio/tsvcis":{"source":"iana"},"audio/uemclip":{"source":"iana"},"audio/ulpfec":{"source":"iana"},"audio/usac":{"source":"iana"},"audio/vdvi":{"source":"iana"},"audio/vmr-wb":{"source":"iana"},"audio/vnd.3gpp.iufp":{"source":"iana"},"audio/vnd.4sb":{"source":"iana"},"audio/vnd.audiokoz":{"source":"iana"},"audio/vnd.celp":{"source":"iana"},"audio/vnd.cisco.nse":{"source":"iana"},"audio/vnd.cmles.radio-events":{"source":"iana"},"audio/vnd.cns.anp1":{"source":"iana"},"audio/vnd.cns.inf1":{"source":"iana"},"audio/vnd.dece.audio":{"source":"iana","extensions":["uva","uvva"]},"audio/vnd.digital-winds":{"source":"iana","extensions":["eol"]},"audio/vnd.dlna.adts":{"source":"iana"},"audio/vnd.dolby.heaac.1":{"source":"iana"},"audio/vnd.dolby.heaac.2":{"source":"iana"},"audio/vnd.dolby.mlp":{"source":"iana"},"audio/vnd.dolby.mps":{"source":"iana"},"audio/vnd.dolby.pl2":{"source":"iana"},"audio/vnd.dolby.pl2x":{"source":"iana"},"audio/vnd.dolby.pl2z":{"source":"iana"},"audio/vnd.dolby.pulse.1":{"source":"iana"},"audio/vnd.dra":{"source":"iana","extensions":["dra"]},"audio/vnd.dts":{"source":"iana","extensions":["dts"]},"audio/vnd.dts.hd":{"source":"iana","extensions":["dtshd"]},"audio/vnd.dts.uhd":{"source":"iana"},"audio/vnd.dvb.file":{"source":"iana"},"audio/vnd.everad.plj":{"source":"iana"},"audio/vnd.hns.audio":{"source":"iana"},"audio/vnd.lucent.voice":{"source":"iana","extensions":["lvp"]},"audio/vnd.ms-playready.media.pya":{"source":"iana","extensions":["pya"]},"audio/vnd.nokia.mobile-xmf":{"source":"iana"},"audio/vnd.nortel.vbk":{"source":"iana"},"audio/vnd.nuera.ecelp4800":{"source":"iana","extensions":["ecelp4800"]},"audio/vnd.nuera.ecelp7470":{"source":"iana","extensions":["ecelp7470"]},"audio/vnd.nuera.ecelp9600":{"source":"iana","extensions":["ecelp9600"]},"audio/vnd.octel.sbc":{"source":"iana"},"audio/vnd.presonus.multitrack":{"source":"iana"},"audio/vnd.qcelp":{"source":"apache"},"audio/vnd.rhetorex.32kadpcm":{"source":"iana"},"audio/vnd.rip":{"source":"iana","extensions":["rip"]},"audio/vnd.rn-realaudio":{"compressible":false},"audio/vnd.sealedmedia.softseal.mpeg":{"source":"iana"},"audio/vnd.vmx.cvsd":{"source":"iana"},"audio/vnd.wave":{"compressible":false},"audio/vorbis":{"source":"iana","compressible":false},"audio/vorbis-config":{"source":"iana"},"audio/wav":{"compressible":false,"extensions":["wav"]},"audio/wave":{"compressible":false,"extensions":["wav"]},"audio/webm":{"source":"apache","compressible":false,"extensions":["weba"]},"audio/x-aac":{"source":"apache","compressible":false,"extensions":["aac"]},"audio/x-aiff":{"source":"apache","extensions":["aif","aiff","aifc"]},"audio/x-caf":{"source":"apache","compressible":false,"extensions":["caf"]},"audio/x-flac":{"source":"apache","extensions":["flac"]},"audio/x-m4a":{"source":"nginx","extensions":["m4a"]},"audio/x-matroska":{"source":"apache","extensions":["mka"]},"audio/x-mpegurl":{"source":"apache","extensions":["m3u"]},"audio/x-ms-wax":{"source":"apache","extensions":["wax"]},"audio/x-ms-wma":{"source":"apache","extensions":["wma"]},"audio/x-pn-realaudio":{"source":"apache","extensions":["ram","ra"]},"audio/x-pn-realaudio-plugin":{"source":"apache","extensions":["rmp"]},"audio/x-realaudio":{"source":"nginx","extensions":["ra"]},"audio/x-tta":{"source":"apache"},"audio/x-wav":{"source":"apache","extensions":["wav"]},"audio/xm":{"source":"apache","extensions":["xm"]},"chemical/x-cdx":{"source":"apache","extensions":["cdx"]},"chemical/x-cif":{"source":"apache","extensions":["cif"]},"chemical/x-cmdf":{"source":"apache","extensions":["cmdf"]},"chemical/x-cml":{"source":"apache","extensions":["cml"]},"chemical/x-csml":{"source":"apache","extensions":["csml"]},"chemical/x-pdb":{"source":"apache"},"chemical/x-xyz":{"source":"apache","extensions":["xyz"]},"font/collection":{"source":"iana","extensions":["ttc"]},"font/otf":{"source":"iana","compressible":true,"extensions":["otf"]},"font/sfnt":{"source":"iana"},"font/ttf":{"source":"iana","compressible":true,"extensions":["ttf"]},"font/woff":{"source":"iana","extensions":["woff"]},"font/woff2":{"source":"iana","extensions":["woff2"]},"image/aces":{"source":"iana","extensions":["exr"]},"image/apng":{"compressible":false,"extensions":["apng"]},"image/avci":{"source":"iana","extensions":["avci"]},"image/avcs":{"source":"iana","extensions":["avcs"]},"image/avif":{"source":"iana","compressible":false,"extensions":["avif"]},"image/bmp":{"source":"iana","compressible":true,"extensions":["bmp","dib"]},"image/cgm":{"source":"iana","extensions":["cgm"]},"image/dicom-rle":{"source":"iana","extensions":["drle"]},"image/emf":{"source":"iana","extensions":["emf"]},"image/fits":{"source":"iana","extensions":["fits"]},"image/g3fax":{"source":"iana","extensions":["g3"]},"image/gif":{"source":"iana","compressible":false,"extensions":["gif"]},"image/heic":{"source":"iana","extensions":["heic"]},"image/heic-sequence":{"source":"iana","extensions":["heics"]},"image/heif":{"source":"iana","extensions":["heif"]},"image/heif-sequence":{"source":"iana","extensions":["heifs"]},"image/hej2k":{"source":"iana","extensions":["hej2"]},"image/hsj2":{"source":"iana","extensions":["hsj2"]},"image/ief":{"source":"iana","extensions":["ief"]},"image/jls":{"source":"iana","extensions":["jls"]},"image/jp2":{"source":"iana","compressible":false,"extensions":["jp2","jpg2"]},"image/jpeg":{"source":"iana","compressible":false,"extensions":["jpeg","jpg","jpe"]},"image/jph":{"source":"iana","extensions":["jph"]},"image/jphc":{"source":"iana","extensions":["jhc"]},"image/jpm":{"source":"iana","compressible":false,"extensions":["jpm"]},"image/jpx":{"source":"iana","compressible":false,"extensions":["jpx","jpf"]},"image/jxr":{"source":"iana","extensions":["jxr"]},"image/jxra":{"source":"iana","extensions":["jxra"]},"image/jxrs":{"source":"iana","extensions":["jxrs"]},"image/jxs":{"source":"iana","extensions":["jxs"]},"image/jxsc":{"source":"iana","extensions":["jxsc"]},"image/jxsi":{"source":"iana","extensions":["jxsi"]},"image/jxss":{"source":"iana","extensions":["jxss"]},"image/ktx":{"source":"iana","extensions":["ktx"]},"image/ktx2":{"source":"iana","extensions":["ktx2"]},"image/naplps":{"source":"iana"},"image/pjpeg":{"compressible":false},"image/png":{"source":"iana","compressible":false,"extensions":["png"]},"image/prs.btif":{"source":"iana","extensions":["btif","btf"]},"image/prs.pti":{"source":"iana","extensions":["pti"]},"image/pwg-raster":{"source":"iana"},"image/sgi":{"source":"apache","extensions":["sgi"]},"image/svg+xml":{"source":"iana","compressible":true,"extensions":["svg","svgz"]},"image/t38":{"source":"iana","extensions":["t38"]},"image/tiff":{"source":"iana","compressible":false,"extensions":["tif","tiff"]},"image/tiff-fx":{"source":"iana","extensions":["tfx"]},"image/vnd.adobe.photoshop":{"source":"iana","compressible":true,"extensions":["psd"]},"image/vnd.airzip.accelerator.azv":{"source":"iana","extensions":["azv"]},"image/vnd.cns.inf2":{"source":"iana"},"image/vnd.dece.graphic":{"source":"iana","extensions":["uvi","uvvi","uvg","uvvg"]},"image/vnd.djvu":{"source":"iana","extensions":["djvu","djv"]},"image/vnd.dvb.subtitle":{"source":"iana","extensions":["sub"]},"image/vnd.dwg":{"source":"iana","extensions":["dwg"]},"image/vnd.dxf":{"source":"iana","extensions":["dxf"]},"image/vnd.fastbidsheet":{"source":"iana","extensions":["fbs"]},"image/vnd.fpx":{"source":"iana","extensions":["fpx"]},"image/vnd.fst":{"source":"iana","extensions":["fst"]},"image/vnd.fujixerox.edmics-mmr":{"source":"iana","extensions":["mmr"]},"image/vnd.fujixerox.edmics-rlc":{"source":"iana","extensions":["rlc"]},"image/vnd.globalgraphics.pgb":{"source":"iana"},"image/vnd.microsoft.icon":{"source":"iana","compressible":true,"extensions":["ico"]},"image/vnd.mix":{"source":"iana"},"image/vnd.mozilla.apng":{"source":"iana","extensions":["apng"]},"image/vnd.ms-dds":{"compressible":true,"extensions":["dds"]},"image/vnd.ms-modi":{"source":"iana","extensions":["mdi"]},"image/vnd.ms-photo":{"source":"apache","extensions":["wdp"]},"image/vnd.net-fpx":{"source":"iana","extensions":["npx"]},"image/vnd.pco.b16":{"source":"iana","extensions":["b16"]},"image/vnd.radiance":{"source":"iana"},"image/vnd.sealed.png":{"source":"iana"},"image/vnd.sealedmedia.softseal.gif":{"source":"iana"},"image/vnd.sealedmedia.softseal.jpg":{"source":"iana"},"image/vnd.svf":{"source":"iana"},"image/vnd.tencent.tap":{"source":"iana","extensions":["tap"]},"image/vnd.valve.source.texture":{"source":"iana","extensions":["vtf"]},"image/vnd.wap.wbmp":{"source":"iana","extensions":["wbmp"]},"image/vnd.xiff":{"source":"iana","extensions":["xif"]},"image/vnd.zbrush.pcx":{"source":"iana","extensions":["pcx"]},"image/webp":{"source":"apache","extensions":["webp"]},"image/wmf":{"source":"iana","extensions":["wmf"]},"image/x-3ds":{"source":"apache","extensions":["3ds"]},"image/x-cmu-raster":{"source":"apache","extensions":["ras"]},"image/x-cmx":{"source":"apache","extensions":["cmx"]},"image/x-freehand":{"source":"apache","extensions":["fh","fhc","fh4","fh5","fh7"]},"image/x-icon":{"source":"apache","compressible":true,"extensions":["ico"]},"image/x-jng":{"source":"nginx","extensions":["jng"]},"image/x-mrsid-image":{"source":"apache","extensions":["sid"]},"image/x-ms-bmp":{"source":"nginx","compressible":true,"extensions":["bmp"]},"image/x-pcx":{"source":"apache","extensions":["pcx"]},"image/x-pict":{"source":"apache","extensions":["pic","pct"]},"image/x-portable-anymap":{"source":"apache","extensions":["pnm"]},"image/x-portable-bitmap":{"source":"apache","extensions":["pbm"]},"image/x-portable-graymap":{"source":"apache","extensions":["pgm"]},"image/x-portable-pixmap":{"source":"apache","extensions":["ppm"]},"image/x-rgb":{"source":"apache","extensions":["rgb"]},"image/x-tga":{"source":"apache","extensions":["tga"]},"image/x-xbitmap":{"source":"apache","extensions":["xbm"]},"image/x-xcf":{"compressible":false},"image/x-xpixmap":{"source":"apache","extensions":["xpm"]},"image/x-xwindowdump":{"source":"apache","extensions":["xwd"]},"message/cpim":{"source":"iana"},"message/delivery-status":{"source":"iana"},"message/disposition-notification":{"source":"iana","extensions":["disposition-notification"]},"message/external-body":{"source":"iana"},"message/feedback-report":{"source":"iana"},"message/global":{"source":"iana","extensions":["u8msg"]},"message/global-delivery-status":{"source":"iana","extensions":["u8dsn"]},"message/global-disposition-notification":{"source":"iana","extensions":["u8mdn"]},"message/global-headers":{"source":"iana","extensions":["u8hdr"]},"message/http":{"source":"iana","compressible":false},"message/imdn+xml":{"source":"iana","compressible":true},"message/news":{"source":"apache"},"message/partial":{"source":"iana","compressible":false},"message/rfc822":{"source":"iana","compressible":true,"extensions":["eml","mime"]},"message/s-http":{"source":"apache"},"message/sip":{"source":"iana"},"message/sipfrag":{"source":"iana"},"message/tracking-status":{"source":"iana"},"message/vnd.si.simp":{"source":"apache"},"message/vnd.wfa.wsc":{"source":"iana","extensions":["wsc"]},"model/3mf":{"source":"iana","extensions":["3mf"]},"model/e57":{"source":"iana"},"model/gltf+json":{"source":"iana","compressible":true,"extensions":["gltf"]},"model/gltf-binary":{"source":"iana","compressible":true,"extensions":["glb"]},"model/iges":{"source":"iana","compressible":false,"extensions":["igs","iges"]},"model/mesh":{"source":"iana","compressible":false,"extensions":["msh","mesh","silo"]},"model/mtl":{"source":"iana","extensions":["mtl"]},"model/obj":{"source":"iana","extensions":["obj"]},"model/prc":{"source":"iana","extensions":["prc"]},"model/step":{"source":"iana"},"model/step+xml":{"source":"iana","compressible":true,"extensions":["stpx"]},"model/step+zip":{"source":"iana","compressible":false,"extensions":["stpz"]},"model/step-xml+zip":{"source":"iana","compressible":false,"extensions":["stpxz"]},"model/stl":{"source":"iana","extensions":["stl"]},"model/u3d":{"source":"iana","extensions":["u3d"]},"model/vnd.collada+xml":{"source":"iana","compressible":true,"extensions":["dae"]},"model/vnd.dwf":{"source":"iana","extensions":["dwf"]},"model/vnd.flatland.3dml":{"source":"iana"},"model/vnd.gdl":{"source":"iana","extensions":["gdl"]},"model/vnd.gs-gdl":{"source":"apache"},"model/vnd.gs.gdl":{"source":"iana"},"model/vnd.gtw":{"source":"iana","extensions":["gtw"]},"model/vnd.moml+xml":{"source":"iana","compressible":true},"model/vnd.mts":{"source":"iana","extensions":["mts"]},"model/vnd.opengex":{"source":"iana","extensions":["ogex"]},"model/vnd.parasolid.transmit.binary":{"source":"iana","extensions":["x_b"]},"model/vnd.parasolid.transmit.text":{"source":"iana","extensions":["x_t"]},"model/vnd.pytha.pyox":{"source":"iana","extensions":["pyo","pyox"]},"model/vnd.rosette.annotated-data-model":{"source":"iana"},"model/vnd.sap.vds":{"source":"iana","extensions":["vds"]},"model/vnd.usdz+zip":{"source":"iana","compressible":false,"extensions":["usdz"]},"model/vnd.valve.source.compiled-map":{"source":"iana","extensions":["bsp"]},"model/vnd.vtu":{"source":"iana","extensions":["vtu"]},"model/vrml":{"source":"iana","compressible":false,"extensions":["wrl","vrml"]},"model/x3d+binary":{"source":"apache","compressible":false,"extensions":["x3db","x3dbz"]},"model/x3d+fastinfoset":{"source":"iana","extensions":["x3db"]},"model/x3d+vrml":{"source":"apache","compressible":false,"extensions":["x3dv","x3dvz"]},"model/x3d+xml":{"source":"iana","compressible":true,"extensions":["x3d","x3dz"]},"model/x3d-vrml":{"source":"iana","extensions":["x3dv"]},"multipart/alternative":{"source":"iana","compressible":false},"multipart/appledouble":{"source":"iana"},"multipart/byteranges":{"source":"iana"},"multipart/digest":{"source":"iana"},"multipart/encrypted":{"source":"iana","compressible":false},"multipart/form-data":{"source":"iana","compressible":false},"multipart/header-set":{"source":"iana"},"multipart/mixed":{"source":"iana"},"multipart/multilingual":{"source":"iana"},"multipart/parallel":{"source":"iana"},"multipart/related":{"source":"iana","compressible":false},"multipart/report":{"source":"iana"},"multipart/signed":{"source":"iana","compressible":false},"multipart/vnd.bint.med-plus":{"source":"iana"},"multipart/voice-message":{"source":"iana"},"multipart/x-mixed-replace":{"source":"iana"},"text/1d-interleaved-parityfec":{"source":"iana"},"text/cache-manifest":{"source":"iana","compressible":true,"extensions":["appcache","manifest"]},"text/calendar":{"source":"iana","extensions":["ics","ifb"]},"text/calender":{"compressible":true},"text/cmd":{"compressible":true},"text/coffeescript":{"extensions":["coffee","litcoffee"]},"text/cql":{"source":"iana"},"text/cql-expression":{"source":"iana"},"text/cql-identifier":{"source":"iana"},"text/css":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["css"]},"text/csv":{"source":"iana","compressible":true,"extensions":["csv"]},"text/csv-schema":{"source":"iana"},"text/directory":{"source":"iana"},"text/dns":{"source":"iana"},"text/ecmascript":{"source":"apache"},"text/encaprtp":{"source":"iana"},"text/enriched":{"source":"iana"},"text/fhirpath":{"source":"iana"},"text/flexfec":{"source":"iana"},"text/fwdred":{"source":"iana"},"text/gff3":{"source":"iana"},"text/grammar-ref-list":{"source":"iana"},"text/html":{"source":"iana","compressible":true,"extensions":["html","htm","shtml"]},"text/jade":{"extensions":["jade"]},"text/javascript":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["js","mjs"]},"text/jcr-cnd":{"source":"iana"},"text/jsx":{"compressible":true,"extensions":["jsx"]},"text/less":{"compressible":true,"extensions":["less"]},"text/markdown":{"source":"iana","compressible":true,"extensions":["md","markdown"]},"text/mathml":{"source":"nginx","extensions":["mml"]},"text/mdx":{"compressible":true,"extensions":["mdx"]},"text/mizar":{"source":"iana"},"text/n3":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["n3"]},"text/parameters":{"source":"iana","charset":"UTF-8"},"text/parityfec":{"source":"iana"},"text/plain":{"source":"iana","compressible":true,"extensions":["txt","text","conf","def","list","log","in","ini"]},"text/provenance-notation":{"source":"iana","charset":"UTF-8"},"text/prs.fallenstein.rst":{"source":"iana"},"text/prs.lines.tag":{"source":"iana","extensions":["dsc"]},"text/prs.prop.logic":{"source":"iana"},"text/raptorfec":{"source":"iana"},"text/red":{"source":"iana"},"text/rfc822-headers":{"source":"iana"},"text/richtext":{"source":"iana","compressible":true,"extensions":["rtx"]},"text/rtf":{"source":"iana","compressible":true,"extensions":["rtf"]},"text/rtp-enc-aescm128":{"source":"iana"},"text/rtploopback":{"source":"iana"},"text/rtx":{"source":"iana"},"text/sgml":{"source":"iana","extensions":["sgml","sgm"]},"text/shaclc":{"source":"iana"},"text/shex":{"source":"iana","extensions":["shex"]},"text/slim":{"extensions":["slim","slm"]},"text/spdx":{"source":"iana","extensions":["spdx"]},"text/strings":{"source":"iana"},"text/stylus":{"extensions":["stylus","styl"]},"text/t140":{"source":"iana"},"text/tab-separated-values":{"source":"iana","compressible":true,"extensions":["tsv"]},"text/troff":{"source":"iana","extensions":["t","tr","roff","man","me","ms"]},"text/turtle":{"source":"iana","charset":"UTF-8","extensions":["ttl"]},"text/ulpfec":{"source":"iana"},"text/uri-list":{"source":"iana","compressible":true,"extensions":["uri","uris","urls"]},"text/vcard":{"source":"iana","compressible":true,"extensions":["vcard"]},"text/vnd.a":{"source":"iana"},"text/vnd.abc":{"source":"iana"},"text/vnd.ascii-art":{"source":"iana"},"text/vnd.curl":{"source":"iana","extensions":["curl"]},"text/vnd.curl.dcurl":{"source":"apache","extensions":["dcurl"]},"text/vnd.curl.mcurl":{"source":"apache","extensions":["mcurl"]},"text/vnd.curl.scurl":{"source":"apache","extensions":["scurl"]},"text/vnd.debian.copyright":{"source":"iana","charset":"UTF-8"},"text/vnd.dmclientscript":{"source":"iana"},"text/vnd.dvb.subtitle":{"source":"iana","extensions":["sub"]},"text/vnd.esmertec.theme-descriptor":{"source":"iana","charset":"UTF-8"},"text/vnd.familysearch.gedcom":{"source":"iana","extensions":["ged"]},"text/vnd.ficlab.flt":{"source":"iana"},"text/vnd.fly":{"source":"iana","extensions":["fly"]},"text/vnd.fmi.flexstor":{"source":"iana","extensions":["flx"]},"text/vnd.gml":{"source":"iana"},"text/vnd.graphviz":{"source":"iana","extensions":["gv"]},"text/vnd.hans":{"source":"iana"},"text/vnd.hgl":{"source":"iana"},"text/vnd.in3d.3dml":{"source":"iana","extensions":["3dml"]},"text/vnd.in3d.spot":{"source":"iana","extensions":["spot"]},"text/vnd.iptc.newsml":{"source":"iana"},"text/vnd.iptc.nitf":{"source":"iana"},"text/vnd.latex-z":{"source":"iana"},"text/vnd.motorola.reflex":{"source":"iana"},"text/vnd.ms-mediapackage":{"source":"iana"},"text/vnd.net2phone.commcenter.command":{"source":"iana"},"text/vnd.radisys.msml-basic-layout":{"source":"iana"},"text/vnd.senx.warpscript":{"source":"iana"},"text/vnd.si.uricatalogue":{"source":"apache"},"text/vnd.sosi":{"source":"iana"},"text/vnd.sun.j2me.app-descriptor":{"source":"iana","charset":"UTF-8","extensions":["jad"]},"text/vnd.trolltech.linguist":{"source":"iana","charset":"UTF-8"},"text/vnd.wap.si":{"source":"iana"},"text/vnd.wap.sl":{"source":"iana"},"text/vnd.wap.wml":{"source":"iana","extensions":["wml"]},"text/vnd.wap.wmlscript":{"source":"iana","extensions":["wmls"]},"text/vtt":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["vtt"]},"text/x-asm":{"source":"apache","extensions":["s","asm"]},"text/x-c":{"source":"apache","extensions":["c","cc","cxx","cpp","h","hh","dic"]},"text/x-component":{"source":"nginx","extensions":["htc"]},"text/x-fortran":{"source":"apache","extensions":["f","for","f77","f90"]},"text/x-gwt-rpc":{"compressible":true},"text/x-handlebars-template":{"extensions":["hbs"]},"text/x-java-source":{"source":"apache","extensions":["java"]},"text/x-jquery-tmpl":{"compressible":true},"text/x-lua":{"extensions":["lua"]},"text/x-markdown":{"compressible":true,"extensions":["mkd"]},"text/x-nfo":{"source":"apache","extensions":["nfo"]},"text/x-opml":{"source":"apache","extensions":["opml"]},"text/x-org":{"compressible":true,"extensions":["org"]},"text/x-pascal":{"source":"apache","extensions":["p","pas"]},"text/x-processing":{"compressible":true,"extensions":["pde"]},"text/x-sass":{"extensions":["sass"]},"text/x-scss":{"extensions":["scss"]},"text/x-setext":{"source":"apache","extensions":["etx"]},"text/x-sfv":{"source":"apache","extensions":["sfv"]},"text/x-suse-ymp":{"compressible":true,"extensions":["ymp"]},"text/x-uuencode":{"source":"apache","extensions":["uu"]},"text/x-vcalendar":{"source":"apache","extensions":["vcs"]},"text/x-vcard":{"source":"apache","extensions":["vcf"]},"text/xml":{"source":"iana","compressible":true,"extensions":["xml"]},"text/xml-external-parsed-entity":{"source":"iana"},"text/yaml":{"compressible":true,"extensions":["yaml","yml"]},"video/1d-interleaved-parityfec":{"source":"iana"},"video/3gpp":{"source":"iana","extensions":["3gp","3gpp"]},"video/3gpp-tt":{"source":"iana"},"video/3gpp2":{"source":"iana","extensions":["3g2"]},"video/av1":{"source":"iana"},"video/bmpeg":{"source":"iana"},"video/bt656":{"source":"iana"},"video/celb":{"source":"iana"},"video/dv":{"source":"iana"},"video/encaprtp":{"source":"iana"},"video/ffv1":{"source":"iana"},"video/flexfec":{"source":"iana"},"video/h261":{"source":"iana","extensions":["h261"]},"video/h263":{"source":"iana","extensions":["h263"]},"video/h263-1998":{"source":"iana"},"video/h263-2000":{"source":"iana"},"video/h264":{"source":"iana","extensions":["h264"]},"video/h264-rcdo":{"source":"iana"},"video/h264-svc":{"source":"iana"},"video/h265":{"source":"iana"},"video/iso.segment":{"source":"iana","extensions":["m4s"]},"video/jpeg":{"source":"iana","extensions":["jpgv"]},"video/jpeg2000":{"source":"iana"},"video/jpm":{"source":"apache","extensions":["jpm","jpgm"]},"video/jxsv":{"source":"iana"},"video/mj2":{"source":"iana","extensions":["mj2","mjp2"]},"video/mp1s":{"source":"iana"},"video/mp2p":{"source":"iana"},"video/mp2t":{"source":"iana","extensions":["ts"]},"video/mp4":{"source":"iana","compressible":false,"extensions":["mp4","mp4v","mpg4"]},"video/mp4v-es":{"source":"iana"},"video/mpeg":{"source":"iana","compressible":false,"extensions":["mpeg","mpg","mpe","m1v","m2v"]},"video/mpeg4-generic":{"source":"iana"},"video/mpv":{"source":"iana"},"video/nv":{"source":"iana"},"video/ogg":{"source":"iana","compressible":false,"extensions":["ogv"]},"video/parityfec":{"source":"iana"},"video/pointer":{"source":"iana"},"video/quicktime":{"source":"iana","compressible":false,"extensions":["qt","mov"]},"video/raptorfec":{"source":"iana"},"video/raw":{"source":"iana"},"video/rtp-enc-aescm128":{"source":"iana"},"video/rtploopback":{"source":"iana"},"video/rtx":{"source":"iana"},"video/scip":{"source":"iana"},"video/smpte291":{"source":"iana"},"video/smpte292m":{"source":"iana"},"video/ulpfec":{"source":"iana"},"video/vc1":{"source":"iana"},"video/vc2":{"source":"iana"},"video/vnd.cctv":{"source":"iana"},"video/vnd.dece.hd":{"source":"iana","extensions":["uvh","uvvh"]},"video/vnd.dece.mobile":{"source":"iana","extensions":["uvm","uvvm"]},"video/vnd.dece.mp4":{"source":"iana"},"video/vnd.dece.pd":{"source":"iana","extensions":["uvp","uvvp"]},"video/vnd.dece.sd":{"source":"iana","extensions":["uvs","uvvs"]},"video/vnd.dece.video":{"source":"iana","extensions":["uvv","uvvv"]},"video/vnd.directv.mpeg":{"source":"iana"},"video/vnd.directv.mpeg-tts":{"source":"iana"},"video/vnd.dlna.mpeg-tts":{"source":"iana"},"video/vnd.dvb.file":{"source":"iana","extensions":["dvb"]},"video/vnd.fvt":{"source":"iana","extensions":["fvt"]},"video/vnd.hns.video":{"source":"iana"},"video/vnd.iptvforum.1dparityfec-1010":{"source":"iana"},"video/vnd.iptvforum.1dparityfec-2005":{"source":"iana"},"video/vnd.iptvforum.2dparityfec-1010":{"source":"iana"},"video/vnd.iptvforum.2dparityfec-2005":{"source":"iana"},"video/vnd.iptvforum.ttsavc":{"source":"iana"},"video/vnd.iptvforum.ttsmpeg2":{"source":"iana"},"video/vnd.motorola.video":{"source":"iana"},"video/vnd.motorola.videop":{"source":"iana"},"video/vnd.mpegurl":{"source":"iana","extensions":["mxu","m4u"]},"video/vnd.ms-playready.media.pyv":{"source":"iana","extensions":["pyv"]},"video/vnd.nokia.interleaved-multimedia":{"source":"iana"},"video/vnd.nokia.mp4vr":{"source":"iana"},"video/vnd.nokia.videovoip":{"source":"iana"},"video/vnd.objectvideo":{"source":"iana"},"video/vnd.radgamettools.bink":{"source":"iana"},"video/vnd.radgamettools.smacker":{"source":"apache"},"video/vnd.sealed.mpeg1":{"source":"iana"},"video/vnd.sealed.mpeg4":{"source":"iana"},"video/vnd.sealed.swf":{"source":"iana"},"video/vnd.sealedmedia.softseal.mov":{"source":"iana"},"video/vnd.uvvu.mp4":{"source":"iana","extensions":["uvu","uvvu"]},"video/vnd.vivo":{"source":"iana","extensions":["viv"]},"video/vnd.youtube.yt":{"source":"iana"},"video/vp8":{"source":"iana"},"video/vp9":{"source":"iana"},"video/webm":{"source":"apache","compressible":false,"extensions":["webm"]},"video/x-f4v":{"source":"apache","extensions":["f4v"]},"video/x-fli":{"source":"apache","extensions":["fli"]},"video/x-flv":{"source":"apache","compressible":false,"extensions":["flv"]},"video/x-m4v":{"source":"apache","extensions":["m4v"]},"video/x-matroska":{"source":"apache","compressible":false,"extensions":["mkv","mk3d","mks"]},"video/x-mng":{"source":"apache","extensions":["mng"]},"video/x-ms-asf":{"source":"apache","extensions":["asf","asx"]},"video/x-ms-vob":{"source":"apache","extensions":["vob"]},"video/x-ms-wm":{"source":"apache","extensions":["wm"]},"video/x-ms-wmv":{"source":"apache","compressible":false,"extensions":["wmv"]},"video/x-ms-wmx":{"source":"apache","extensions":["wmx"]},"video/x-ms-wvx":{"source":"apache","extensions":["wvx"]},"video/x-msvideo":{"source":"apache","extensions":["avi"]},"video/x-sgi-movie":{"source":"apache","extensions":["movie"]},"video/x-smv":{"source":"apache","extensions":["smv"]},"x-conference/x-cooltalk":{"source":"apache","extensions":["ice"]},"x-shader/x-fragment":{"compressible":true},"x-shader/x-vertex":{"compressible":true}}');
;// CONCATENATED MODULE: ./src/modules/mime-types.js

 // mime-types, mime-db
// Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
// Copyright (c) 2015-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
// MIT Licensed
//
// ============================================================================
//
// (The MIT License)
//
// Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
// Copyright (c) 2015-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// ============================================================================

/**
 * Module variables.
 * @private
 */

const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
const TEXT_TYPE_REGEXP = /^text\//i;
let extensionMapList = Object.create(null);
let typeMapList = Object.create(null); // Populate the extensions/types maps

populateMaps(extensionMapList, typeMapList);
/**
 * Get the default charset for a MIME type.
 *
 * @param {string} inputMimeType
 * @return {boolean|string}
 */

function getCharset(inputMimeType) {
  if (!inputMimeType || typeof inputMimeType !== 'string') return false;
  let match = EXTRACT_TYPE_REGEXP.exec(inputMimeType);
  let mime = match && mime_db_namespaceObject[match[1].toLowerCase()];
  if (mime && mime.charset) return mime.charset; // default text/* to utf-8

  if (match && TEXT_TYPE_REGEXP.test(match[1])) return 'UTF-8';
  return false;
}
/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} inputData
 * @return {boolean|string}
 */


function getContentType(inputData) {
  if (!inputData || typeof inputData !== 'string') return false;
  let mime = inputData;
  if (inputData.indexOf('/') === -1) mime = lookupMimeType(inputData);
  if (!mime) return false;

  if (mime.indexOf('charset') === -1) {
    let detectedCharset = getCharset(mime);
    if (detectedCharset) mime += '; charset=' + detectedCharset.toLowerCase();
  }

  return mime;
}
/**
 * Get the default extension for a MIME type.
 *
 * @param {string} inputContentType
 * @return {boolean|string}
 */


function getExtension(inputContentType) {
  if (!inputContentType || typeof inputContentType !== 'string') return false;
  let match = EXTRACT_TYPE_REGEXP.exec(inputContentType);
  let possibleExtensions = match && extensionMapList[match[1].toLowerCase()];
  if (!possibleExtensions || !possibleExtensions.length) return false;
  return possibleExtensions[0];
}
/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */


function lookupMimeType(path) {
  if (!path || typeof path !== 'string') return false;
  let extension = (0,modules_path.extname)('x.' + path).toLowerCase();
  if (!extension) return false;
  return typeMapList[extension] || false;
}
/**
 * Populate the extensions and types maps.
 * @private
 */


function populateMaps(extensionMap, typeMap) {
  let preference = ['nginx', 'apache', undefined, 'iana'];
  Object.keys(mime_db_namespaceObject).forEach(type => {
    let mime = mime_db_namespaceObject[type];
    let fileExtensions = mime.extensions;
    if (!fileExtensions || !fileExtensions.length) return; // mime -> extensions

    extensionMap[type] = fileExtensions; // extension -> mime

    for (let i = 0; i < fileExtensions.length; i++) {
      let extension = fileExtensions[i];

      if (typeMap[extension]) {
        let from = preference.indexOf(mime_db_namespaceObject[typeMap[extension]].source);
        let to = preference.indexOf(mime.source);
        if (typeMap[extension] !== 'application/octet-stream' && (from > to || from === to && typeMap[extension].substring(0, 12) === 'application/')) continue;
      } // set the extension -> mime


      typeMap[extension] = type;
    }
  });
}

/* harmony default export */ const mime_types = ({
  charset: getCharset,
  contentType: getContentType,
  extension: getExtension,
  lookup: lookupMimeType
});
// EXTERNAL MODULE: ./src/modules/module.js
var modules_module = __webpack_require__(301);
// EXTERNAL MODULE: ./src/modules/process.js
var process = __webpack_require__(323);
// EXTERNAL MODULE: ../common/constants.js
var constants = __webpack_require__(65);
// EXTERNAL MODULE: ./src/ipc.js + 1 modules
var ipc = __webpack_require__(229);
;// CONCATENATED MODULE: ./src/modules/request.js


const methods = ["get", "put", "post", "delete", "head"];
const aliases = {
  del: "delete"
};

function parseArguments() {
  let url, options, callback;

  for (const arg of arguments) {
    switch (typeof arg) {
      case arg !== null && "object":
        options = arg;

        if ("url" in options) {
          url = options.url;
        }

        break;

      case !url && "string":
        url = arg;
        break;

      case !callback && "function":
        callback = arg;
        break;
    }
  }

  return {
    url,
    options,
    callback
  };
}

function validOptions(url, callback) {
  return typeof url === "string" && typeof callback === "function";
}

function request() {
  const {
    url,
    options = {},
    callback
  } = parseArguments.apply(this, arguments);
  if (!validOptions(url, callback)) return null;
  ipc/* default.send */.Z.send(constants/* IPCEvents.MAKE_REQUESTS */.A.MAKE_REQUESTS, {
    url: url,
    options: options
  }, data => {
    const res = new Response(data);
    res.statusCode = res.status;
    callback(null, res, data);
  });
}
Object.assign(request, Object.fromEntries(methods.concat(Object.keys(aliases)).map(method => [method, function () {
  const {
    url,
    options = {},
    callback
  } = parseArguments.apply(this, arguments);
  if (!validOptions(url, callback)) return null;
  options.method = method;
  request(url, options, callback);
}])));
;// CONCATENATED MODULE: ./src/modules/require.js












function require_require(mod) {
  switch (mod) {
    case "_discordmodules":
      return discordmodules/* default */.Z;

    case "_webpack":
      return webpack;

    case "buffer":
      return discordmodules/* default.Buffer */.Z.Buffer;

    case "child_process":
      return;

    case "electron":
      return electron;

    case "events":
      return events/* default */.Z;

    case "fs":
    case "original-fs":
      return fs/* default */.ZP;

    case "http":
    case "https":
      return https;

    case "mime-types":
      return mime_types;

    case "module":
      return modules_module/* default */.Z;

    case "path":
      return modules_path;

    case "process":
      return process/* default */.Z;

    case "request":
      return request;

    case "url":
      return {
        parse: urlString => {
          return new URL(urlString);
        }
      };

    case "vm":
      return vm_namespaceObject;

    default:
      return modules_module/* default._require */.Z._require(mod, require_require);
  }
}
require_require.cache = {};

require_require.resolve = path => {
  for (const key of Object.keys(require_require.cache)) {
    if (key.startsWith(path)) return require_require.cache[key];
  }
};

/***/ }),

/***/ 343:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Filters": () => (/* binding */ Filters),
/* harmony export */   "default": () => (/* binding */ WebpackModules)
/* harmony export */ });
/* harmony import */ var _common_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(602);
/**
 * Allows for grabbing and searching through Discord's webpacked modules.
 * @module WebpackModules
 * @version 0.0.2
 */

/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */

/**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */

class Filters {
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {Array<string>} props - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */
  static byProps(props, filter = m => m) {
    return module => {
      if (!module) return false;
      if (typeof module !== "object" && typeof module !== "function") return false;
      const component = filter(module);
      if (!component) return false;

      for (let p = 0; p < props.length; p++) {
        if (!(props[p] in component)) return false;
      }

      return true;
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
   * @param {Array<string>} fields - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
   */


  static byPrototypeFields(fields, filter = m => m) {
    return module => {
      if (!module) return false;
      if (typeof module !== "object" && typeof module !== "function") return false;
      const component = filter(module);
      if (!component) return false;
      if (!component.prototype) return false;

      for (let f = 0; f < fields.length; f++) {
        if (!(fields[f] in component.prototype)) return false;
      }

      return true;
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
   * @param {RegExp} search - A RegExp to check on the module
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */


  static byRegex(search, filter = m => m) {
    return module => {
      const method = filter(module);
      if (!method) return false;
      let methodString = "";

      try {
        methodString = method.toString([]);
      } catch (err) {
        methodString = method.toString();
      }

      return methodString.search(search) !== -1;
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
   * @param {...String} search - A RegExp to check on the module
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
   */


  static byStrings(...strings) {
    return module => {
      let moduleString = "";

      try {
        moduleString = module.toString([]);
      } catch (err) {
        moduleString = module.toString();
      }

      for (const s of strings) {
        if (!moduleString.includes(s)) return false;
      }

      return true;
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {string} name - Name the module should have
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */


  static byDisplayName(name) {
    return module => {
      return module && module.displayName === name;
    };
  }
  /**
   * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
   * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
   * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
   */


  static combine(...filters) {
    return module => {
      return filters.every(filter => filter(module));
    };
  }

}
const hasThrown = new WeakSet();
class WebpackModules {
  static find(filter, first = true) {
    return this.getModule(filter, {
      first
    });
  }

  static findAll(filter) {
    return this.getModule(filter, {
      first: false
    });
  }

  static findByUniqueProperties(props, first = true) {
    return first ? this.getByProps(...props) : this.getAllByProps(...props);
  }

  static findByDisplayName(name) {
    return this.getByDisplayName(name);
  }
  /**
   * Finds a module using a filter function.
   * @param {function} filter A function to use to filter modules
   * @param {object} [options] Set of options to customize the search
   * @param {Boolean} [options.first=true] Whether to return only the first matching module
   * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
   * @return {Any}
   */


  static getModule(filter, options = {}) {
    const {
      first = true,
      defaultExport = true
    } = options;

    const wrappedFilter = (exports, module, moduleId) => {
      try {
        var _exports$default, _exports$default2, _exports$default3, _exports$default4, _exports$default5, _exports$default6, _exports$default7, _exports$default8;

        if (exports !== null && exports !== void 0 && (_exports$default = exports.default) !== null && _exports$default !== void 0 && _exports$default.remove && exports !== null && exports !== void 0 && (_exports$default2 = exports.default) !== null && _exports$default2 !== void 0 && _exports$default2.set && exports !== null && exports !== void 0 && (_exports$default3 = exports.default) !== null && _exports$default3 !== void 0 && _exports$default3.clear && exports !== null && exports !== void 0 && (_exports$default4 = exports.default) !== null && _exports$default4 !== void 0 && _exports$default4.get && !(exports !== null && exports !== void 0 && (_exports$default5 = exports.default) !== null && _exports$default5 !== void 0 && _exports$default5.sort)) return false;
        if (exports.remove && exports.set && exports.clear && exports.get && !exports.sort) return false;
        if (exports !== null && exports !== void 0 && (_exports$default6 = exports.default) !== null && _exports$default6 !== void 0 && _exports$default6.getToken || exports !== null && exports !== void 0 && (_exports$default7 = exports.default) !== null && _exports$default7 !== void 0 && _exports$default7.getEmail || exports !== null && exports !== void 0 && (_exports$default8 = exports.default) !== null && _exports$default8 !== void 0 && _exports$default8.showToken) return false;
        if (exports.getToken || exports.getEmail || exports.showToken) return false;
        return filter(exports, module, moduleId);
      } catch (err) {
        if (!hasThrown.has(filter)) _common_logger__WEBPACK_IMPORTED_MODULE_0__/* .default.warn */ .Z.warn("WebpackModules~getModule", "Module filter threw an exception.", filter, err);
        hasThrown.add(filter);
        return false;
      }
    };

    const modules = this.getAllModules();
    const rm = [];
    const indices = Object.keys(modules);

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (!modules.hasOwnProperty(index)) continue;
      const module = modules[index];
      const {
        exports
      } = module;
      if (exports === window) continue;
      let foundModule = null;

      if (typeof exports === "object") {
        const wrappers = Object.getOwnPropertyDescriptors(exports);
        const getters = Object.keys(wrappers).filter(k => wrappers[k].get);

        if (getters.length) {
          for (const getter of getters) {
            const wrappedExport = exports[getter];
            if (!wrappedExport) continue;
            if (wrappedExport.__esModule && wrappedExport.default && wrappedFilter(wrappedExport.default, module, index)) foundModule = defaultExport ? wrappedExport.default : wrappedExport;
            if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
          }
        } else {
          if (!exports) continue;
          if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
          if (wrappedFilter(exports, module, index)) foundModule = exports;
          if (!foundModule) continue;
          if (first) return foundModule;
          rm.push(foundModule);
        }
      } else {
        if (!exports) continue;
        if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
        if (wrappedFilter(exports, module, index)) foundModule = exports;
        if (!foundModule) continue;
        if (first) return foundModule;
        rm.push(foundModule);
      }
    }

    return first || rm.length == 0 ? undefined : rm;
  }
  /**
   * Finds multiple modules using multiple filters.
   *
   * @param {...object} queries Whether to return only the first matching module
   * @param {Function} queries.filter A function to use to filter modules
   * @param {Boolean} [queries.first=true] Whether to return only the first matching module
   * @param {Boolean} [queries.defaultExport=true] Whether to return default export when matching the default export
   * @return {Any}
   */


  static getBulk(...queries) {
    const modules = this.getAllModules();
    const returnedModules = Array(queries.length);
    const indices = Object.keys(modules);

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (!modules.hasOwnProperty(index)) continue;
      const module = modules[index];
      const {
        exports
      } = module;
      if (!exports) continue;

      for (let q = 0; q < queries.length; q++) {
        const query = queries[q];
        const {
          filter,
          first = true,
          defaultExport = true
        } = query;
        if (first && returnedModules[q]) continue; // If they only want the first, and we already found it, move on

        if (!first && !returnedModules[q]) returnedModules[q] = []; // If they want multiple and we haven't setup the subarry, do it now

        const wrappedFilter = (ex, mod, moduleId) => {
          try {
            return filter(ex, mod, moduleId);
          } catch (err) {
            if (!hasThrown.has(filter)) _common_logger__WEBPACK_IMPORTED_MODULE_0__/* .default.warn */ .Z.warn("WebpackModules~getBulk", "Module filter threw an exception.", filter, err);
            hasThrown.add(filter);
            return false;
          }
        };

        let foundModule = null;

        if (typeof exports === "object") {
          const wrappers = Object.getOwnPropertyDescriptors(exports);
          const getters = Object.keys(wrappers).filter(k => wrappers[k].get);

          if (getters.length) {
            for (const getter of getters) {
              const wrappedExport = exports[getter];
              if (!wrappedExport) continue;
              if (wrappedExport.__esModule && wrappedExport.default && wrappedFilter(wrappedExport.default, module, index)) foundModule = defaultExport ? wrappedExport.default : wrappedExport;
              if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
              if (!foundModule) continue;
              if (first) returnedModules[q] = foundModule;else returnedModules[q].push(foundModule);
            }
          } else {
            if (!exports) continue;
            if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
            if (wrappedFilter(exports, module, index)) foundModule = exports;
            if (!foundModule) continue;
            if (first) returnedModules[q] = foundModule;else returnedModules[q].push(foundModule);
          }
        } else {
          if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
          if (wrappedFilter(exports, module, index)) foundModule = exports;
          if (!foundModule) continue;
          if (first) returnedModules[q] = foundModule;else returnedModules[q].push(foundModule);
        }
      }
    }

    return returnedModules;
  }
  /**
   * Finds all modules matching a filter function.
   * @param {Function} filter A function to use to filter modules
   */


  static getModules(filter) {
    return this.getModule(filter, {
      first: false
    });
  }
  /**
   * Finds a module by its display name.
   * @param {String} name The display name of the module
   * @return {Any}
   */


  static getByDisplayName(name) {
    return this.getModule(Filters.byDisplayName(name));
  }
  /**
   * Finds a module using its code.
   * @param {RegEx} regex A regular expression to use to filter modules
   * @param {Boolean} first Whether to return the only the first matching module
   * @return {Any}
   */


  static getByRegex(regex, first = true) {
    return this.getModule(Filters.byRegex(regex), {
      first
    });
  }
  /**
   * Finds a single module using properties on its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */


  static getByPrototypes(...prototypes) {
    return this.getModule(Filters.byPrototypeFields(prototypes));
  }
  /**
   * Finds all modules with a set of properties of its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */


  static getAllByPrototypes(...prototypes) {
    return this.getModule(Filters.byPrototypeFields(prototypes), {
      first: false
    });
  }
  /**
   * Finds a single module using its own properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */


  static getByProps(...props) {
    return this.getModule(Filters.byProps(props));
  }
  /**
   * Finds all modules with a set of properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */


  static getAllByProps(...props) {
    return this.getModule(Filters.byProps(props), {
      first: false
    });
  }
  /**
   * Finds a single module using a set of strings.
   * @param {...String} props Strings to use to filter modules
   * @return {Any}
   */


  static getByString(...strings) {
    return this.getModule(Filters.byStrings(...strings));
  }
  /**
   * Finds all modules with a set of strings.
   * @param {...String} strings Strings to use to filter modules
   * @return {Any}
   */


  static getAllByString(...strings) {
    return this.getModule(Filters.byStrings(...strings), {
      first: false
    });
  }
  /**
   * Finds a module that lazily loaded.
   * @param {(m) => boolean} filter A function to use to filter modules.
   * @param {object} [options] Set of options to customize the search
   * @param {AbortSignal} [options.signal] AbortSignal of an AbortController to cancel the promise
   * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
   * @returns {Promise<any>}
   */


  static getLazy(filter, options = {}) {
    /** @type {AbortSignal} */
    const abortSignal = options.signal;
    const defaultExport = options.defaultExport ?? true;
    const fromCache = this.getModule(filter);
    if (fromCache) return Promise.resolve(fromCache);

    const wrappedFilter = exports => {
      try {
        return filter(exports);
      } catch (err) {
        if (!hasThrown.has(filter)) _common_logger__WEBPACK_IMPORTED_MODULE_0__/* .default.warn */ .Z.warn("WebpackModules~getModule", "Module filter threw an exception.", filter, err);
        hasThrown.add(filter);
        return false;
      }
    };

    return new Promise(resolve => {
      const cancel = () => this.removeListener(listener);

      const listener = function (exports) {
        if (!exports) return;
        let foundModule = null;

        if (typeof exports === "object") {
          const wrappers = Object.getOwnPropertyDescriptors(exports);
          const getters = Object.keys(wrappers).filter(k => wrappers[k].get);

          if (getters.length) {
            for (const getter of getters) {
              const wrappedExport = exports[getter];
              if (!wrappedExport) continue;
              if (wrappedExport.__esModule && wrappedExport.default && wrappedFilter(wrappedExport.default)) foundModule = defaultExport ? wrappedExport.default : wrappedExport;
              if (wrappedFilter(wrappedExport)) foundModule = wrappedExport;
            }
          } else {
            if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = defaultExport ? exports.default : exports;
            if (wrappedFilter(exports)) foundModule = exports;
          }
        } else {
          if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = defaultExport ? exports.default : exports;
          if (wrappedFilter(exports)) foundModule = exports;
        }

        if (!foundModule) return;
        cancel();
        resolve(foundModule);
      };

      this.addListener(listener);
      abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener("abort", () => {
        cancel();
        resolve();
      });
    });
  }
  /**
   * Discord's __webpack_require__ function.
   */


  static get require() {
    if (this._require) return this._require;
    const id = "bdbrowser" + Math.random().toString().slice(2, 3);

    let __discord_webpack_require__;

    if (typeof webpackJsonp !== "undefined") {
      __discord_webpack_require__ = window.webpackJsonp.push([[], {
        [id]: (module, exports, __internal_require__) => module.exports = __internal_require__
      }, [[id]]]);
    } else if (typeof window[this.chunkName] !== "undefined") {
      window[this.chunkName].push([[id], {}, __internal_require__ => __discord_webpack_require__ = __internal_require__]);
    }

    delete __discord_webpack_require__.m[id];
    delete __discord_webpack_require__.c[id];
    return this._require = __discord_webpack_require__;
  }
  /**
   * Returns all loaded modules.
   * @return {Array}
   */


  static getAllModules() {
    return this.require.c;
  } // Webpack Chunk Observing


  static get chunkName() {
    return "webpackChunkdiscord_app";
  }

  static initialize() {
    this.handlePush = this.handlePush.bind(this);
    this.listeners = new Set();
    this.__ORIGINAL_PUSH__ = window[this.chunkName].push;
    Object.defineProperty(window[this.chunkName], "push", {
      configurable: true,
      get: () => this.handlePush,
      set: newPush => {
        this.__ORIGINAL_PUSH__ = newPush;
        Object.defineProperty(window[this.chunkName], "push", {
          value: this.handlePush,
          configurable: true,
          writable: true
        });
      }
    });
  }
  /**
   * Adds a listener for when discord loaded a chunk. Useful for subscribing to lazy loaded modules.
   * @param {Function} listener - Function to subscribe for chunks
   * @returns {Function} A cancelling function
   */


  static addListener(listener) {
    this.listeners.add(listener);
    return this.removeListener.bind(this, listener);
  }
  /**
   * Removes a listener for when discord loaded a chunk.
   * @param {Function} listener
   * @returns {boolean}
   */


  static removeListener(listener) {
    return this.listeners.delete(listener);
  }

  static handlePush(chunk) {
    const [, modules] = chunk;

    for (const moduleId in modules) {
      const originalModule = modules[moduleId];

      modules[moduleId] = (module, exports, require) => {
        try {
          Reflect.apply(originalModule, null, [module, exports, require]);
          const listeners = [...this.listeners];

          for (let i = 0; i < listeners.length; i++) {
            try {
              listeners[i](exports);
            } catch (error) {
              _common_logger__WEBPACK_IMPORTED_MODULE_0__/* .default.stacktrace */ .Z.stacktrace("WebpackModules", "Could not fire callback listener:", error);
            }
          }
        } catch (error) {
          _common_logger__WEBPACK_IMPORTED_MODULE_0__/* .default.stacktrace */ .Z.stacktrace("WebpackModules", "Could not patch pushed module", error);
        }
      };

      Object.assign(modules[moduleId], originalModule, {
        toString: () => originalModule.toString()
      });
    }

    return Reflect.apply(this.__ORIGINAL_PUSH__, window[this.chunkName], [chunk]);
  }

}
WebpackModules.initialize();

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/* harmony import */ var common_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(706);
/* harmony import */ var common_logger__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(602);
/* harmony import */ var common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(229);
/* harmony import */ var _modules_discordmodules__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(828);
/* harmony import */ var _modules_discordnative__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(735);
/* harmony import */ var _modules_fetch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(551);
/* harmony import */ var _modules_fs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(432);
/* harmony import */ var _modules_monaco__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(585);
/* harmony import */ var _modules_bdpreload__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(154);
/* harmony import */ var _modules_process__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(323);
/* harmony import */ var _modules_require__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(164);
/* harmony import */ var _modules_patches__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(580);












Object.defineProperty(_modules_discordmodules__WEBPACK_IMPORTED_MODULE_3__/* .default.ElectronModule */ .Z.ElectronModule, "canBootstrapNewUpdater", {
  value: false,
  configurable: true
});
window.fallbackClassName = "bdfdb_fallbackClass";
window.value = null;
window.firstArray = [];
window.user = "";
window.global = window;
window.DiscordNative = _modules_discordnative__WEBPACK_IMPORTED_MODULE_4__;
window.fetchWithoutCSP = _modules_fetch__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z;
window.fs = _modules_fs__WEBPACK_IMPORTED_MODULE_6__/* .default */ .ZP;
window.IPC = _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default */ .Z;
window.monaco = _modules_monaco__WEBPACK_IMPORTED_MODULE_7__;
window.process = _modules_process__WEBPACK_IMPORTED_MODULE_9__/* .default */ .Z;
window.require = _modules_require__WEBPACK_IMPORTED_MODULE_10__/* .default */ .Z; // Electron 17 requirements adapted from the preloader.

let hasInitialized = false;

window.BetterDiscordPreload = () => {
  if (hasInitialized) return null;
  hasInitialized = true;
  return _modules_bdpreload__WEBPACK_IMPORTED_MODULE_8__/* .default */ .Z;
};

let bdScriptUrl;
 // const getConfig = key => new Promise(resolve => chrome.storage.sync.get(key, resolve));

async function initialize() {
  // Database connection
  const vfsDatabaseConnection = await _modules_fs__WEBPACK_IMPORTED_MODULE_6__/* .default.openDatabase */ .ZP.openDatabase();
  if (!vfsDatabaseConnection) throw new Error("BdBrowser Error: IndexedDB VFS database connection could not be established!"); // VFS initialization

  const vfsInitialize = await _modules_fs__WEBPACK_IMPORTED_MODULE_6__/* .default.initializeVfs */ .ZP.initializeVfs();
  if (!vfsInitialize) throw new Error("BdBrowser Error: IndexedDB VFS could not be initialized!"); // Initialize BetterDiscord

  common_logger__WEBPACK_IMPORTED_MODULE_12__/* .default.log */ .Z.log("Frontend", `Loading, Environment = ${"production"}`);
  common_dom__WEBPACK_IMPORTED_MODULE_0__/* .default.injectCSS */ .Z.injectCSS("BetterDiscordWebStyles", `.CodeMirror {height: 100% !important;}`);
  _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.GET_RESOURCE_URL */ .A.GET_RESOURCE_URL, {
    url: "dist/betterdiscord.js"
  }, selectBetterDiscordEnvironment);
}

async function selectBetterDiscordEnvironment(localScriptUrl) {
  bdScriptUrl =  false ? 0 : localScriptUrl;
  _ipc__WEBPACK_IMPORTED_MODULE_2__/* .default.send */ .Z.send(common_constants__WEBPACK_IMPORTED_MODULE_1__/* .IPCEvents.MAKE_REQUESTS */ .A.MAKE_REQUESTS, {
    url: bdScriptUrl
  }, loadBetterDiscord);
}

async function loadBetterDiscord(scriptBody) {
  var _DiscordModules$UserS;

  const callback = async () => {
    _modules_discordmodules__WEBPACK_IMPORTED_MODULE_3__/* .default.Dispatcher.unsubscribe */ .Z.Dispatcher.unsubscribe("CONNECTION_OPEN", callback);
    common_logger__WEBPACK_IMPORTED_MODULE_12__/* .default.log */ .Z.log("Frontend", `Loading BetterDiscord from ${bdScriptUrl}...`);

    try {
      // TODO: Proper solution to prevent overwrite of window.require without causing exceptions.
      //       Object.defineProperty cannot be used to prevent changes because the attempted
      //       overwrite will cause an exception, preventing BD from loading, so we need something
      //       that does not cause an exception and still retains control or watch over w.r...
      scriptBody = scriptBody.replace(/=window.require=.*?;/, "=window.require;"); // TODO: Proper solution for the path import in addonupdater.js.

      scriptBody = scriptBody.replace(/this\.cache\[.*?\.basename/, "this.cache[require(\"path\").basename");
      eval(`(() => { ${scriptBody} })(window.fetchWithoutCSP)`);
    } catch (error) {
      common_logger__WEBPACK_IMPORTED_MODULE_12__/* .default.error */ .Z.error("Frontend", "Failed to load BetterDiscord:\n", error);
    }
  };

  if (!((_DiscordModules$UserS = _modules_discordmodules__WEBPACK_IMPORTED_MODULE_3__/* .default.UserStore */ .Z.UserStore) !== null && _DiscordModules$UserS !== void 0 && _DiscordModules$UserS.getCurrentUser())) {
    common_logger__WEBPACK_IMPORTED_MODULE_12__/* .default.log */ .Z.log("Frontend", "getCurrentUser failed, registering callback.");
    _modules_discordmodules__WEBPACK_IMPORTED_MODULE_3__/* .default.Dispatcher.subscribe */ .Z.Dispatcher.subscribe("CONNECTION_OPEN", callback);
  } else {
    common_logger__WEBPACK_IMPORTED_MODULE_12__/* .default.log */ .Z.log("Frontend", "getCurrentUser succeeded, running setImmediate().");
    setImmediate(callback);
  }
}

initialize();
})();

/******/ })()
;