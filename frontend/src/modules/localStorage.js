import DiscordModules from "./discordmodules";

var discordStorage;

export function getItem(key, item) {
    const storage = discordStorage || (discordStorage = DiscordModules.StorageModule);

    return storage.get(key, item);
}

export function setItem(key, item) {
    const storage = discordStorage || (discordStorage = DiscordModules.StorageModule);

    return storage.set(key, item);
}
