import DiscordModules from "./discordmodules";

export function getItem(key) {
    return DiscordModules.StorageModule.get(key);
}

export function setItem(key, item) {
    DiscordModules.StorageModule.set(key, item);
}
