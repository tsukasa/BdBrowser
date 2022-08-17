import Utilities from "utilities";
import Webpack   from "webpack";

export default Utilities.memoizeObject({
    /* Current User Info, State and Settings */
    get ThemeStore() { return Webpack.findByProps("addChangeListener", "theme"); },

    /* User Stores and Utils */
    get UserStore() { return Webpack.findByProps("getCurrentUser"); },

    /* Electron & Other Internals with Utils */
    get ElectronModule() { return Webpack.findByProps("setBadge"); },
    get Dispatcher() { return Webpack.findByProps("dispatch", "subscribe", "wait", "unsubscribe"); },
    get RouterModule() { return Webpack.findByProps("listeners", "flushRoute"); },

    /* Other Utils */
    get StorageModule() { return Webpack.findByProps("get", "set", "stringify"); }
});
