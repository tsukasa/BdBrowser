import DiscordModules from "discordmodules";
import electron from "app_shims/electron";
import Events from "modules/events";
import fs from "node_shims/fs";
import Https from "node_shims/https";
import mimeTypes from "node_shims/mime-types";
import Module from "modules/module";
import * as vm from "node_shims/vm";
import path from "node_shims/path";
import process from "app_shims/process";
import RequestModule from "node_shims/request";

export default function require(mod) {
    switch (mod) {
        case "buffer":
            return DiscordModules.Buffer;

        case "child_process":
            return;

        case "electron":
            return electron;

        case "events":
            return Events;

        case "fs":
        case "original-fs":
            return fs;

        case "http":
        case "https":
            return Https;

        case "mime-types":
            return mimeTypes;

        case "module":
            return Module;

        case "path":
            return path;

        case "process":
            return process;

        case "request":
            return RequestModule;

        case "url":
            return {
                parse: (urlString) => {
                    return new URL(urlString);
                }
            };

        case "vm":
            return vm;

        default:
            return Module._require(mod, require);
    }
}

require.cache = {};
require.resolve = (modulePath) => {
    for (const key of Object.keys(require.cache)) {
        if (key.startsWith(modulePath)) {
            return require.cache[key];
        }
    }
};
