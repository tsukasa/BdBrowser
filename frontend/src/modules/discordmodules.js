import Utilities from "utilities";
import Webpack   from "webpack";

export default Utilities.memoizeObject({
    /* Current User Info, State and Settings */
    get ThemeStore() { return Webpack.getByProps("addChangeListener", "theme"); },

    /* User Stores and Utils */
    get UserStore() { return Webpack.getByProps("getCurrentUser", "getUser"); },

    /* Electron & Other Internals with Utils */
    get ElectronModule() { return Webpack.getByProps("setBadge"); },
    get Dispatcher() { return Webpack.getByProps("dispatch", "subscribe", "wait", "unsubscribe", "register"); },
    get RouterModule() { return Webpack.getByProps("listeners", "rewrites", "flushRoute"); },

    /* Other Utils */
    get StorageModule() { return Webpack.getByProps("get", "set", "stringify"); }
});
