import DiscordModules from "modules/discordmodules";

export default class LocalStorage {
    static getItem(key) {
        return DiscordModules.StorageModule.get(key);
    }

    static setItem(key, item) {
        DiscordModules.StorageModule.set(key, item);
    }
}
