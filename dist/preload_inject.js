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
;// CONCATENATED MODULE: ./src/index.js
/**
 * This script is being used as a content script by the Chrome extension.
 * Contrary to `backend.js` it runs at `document_start` so it is able to
 * inject the contents of `preload.js` early into the document.
 */


function initialize() {
  injectPreload();
}
/**
 * Injects the `preload.js` into the document, so it can execute early.
 * This roundabout way is required due to restrictions on how content scripts
 * can interact with the top document.
 */


function injectPreload() {
  Logger.log("Injector", "Injecting preload.js into document to prepare environment...");
  const scriptElement = document.createElement("script");
  scriptElement.src = chrome.runtime.getURL("dist/preload.js");
  (document.head || document.documentElement).appendChild(scriptElement);
}

initialize();
/******/ })()
;