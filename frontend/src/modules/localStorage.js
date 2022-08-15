import DiscordModules from "./discordmodules";

export function getItem(key, item) {
    return DiscordModules.StorageModule.get(key, item);
}

export function setItem(key, item) {
    return DiscordModules.StorageModule.set(key, item);
}
