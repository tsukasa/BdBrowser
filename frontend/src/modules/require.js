import * as electron from "./electron";
import * as Https from "./https";
import * as path from "./path";
import * as vm from "./vm";
import * as Webpack from "./webpack";
import fs from "./fs";
import DiscordModules from "./discordmodules";
import Events from "./events";
import mimeTypes from "./mime-types";
import Module from "./module";
import process from "./process";
import RequestModule from "./request";

export default function require(mod) {
    switch (mod) {
        case "_discordmodules":
            return DiscordModules;

        case "fs":
            return fs;

        case "vm":
            return vm;

        case "path":
            return path;

        case "module":
            return Module;

        case "electron":
            return electron;

        case "events":
            return Events;

        case "request":
            return RequestModule;

        case "_webpack":
            return Webpack;

        case "process":
            return process;

        case "mime-types":
            return mimeTypes;

        case "url":
            return {
                parse: (urlString) => {
                    return new URL(urlString);
                }
            };

        case "child_process":
            return;

        case "http":
        case "https":
            return Https;

        default:
            return Module._require(mod, require);
    }
}

require.resolve = () => void 0;
require.cache = {};
