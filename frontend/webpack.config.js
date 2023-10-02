const path = require("path");

module.exports = (env, argv) => ({
    mode: "development",
    target: "node",
    devtool: argv.mode === "production" ? undefined : "eval-source-map",
    entry: path.resolve(__dirname, "src", "index.js"),
    optimization: {
        minimize: false
    },
    output: {
        filename: "frontend.js",
        path: path.resolve(__dirname, "..", "dist", "js")
    },
    resolve: {
        extensions: [".js", ".jsx"],
        modules: [
            path.resolve(__dirname, "src", "modules")
        ],
        alias: {
            assets: path.join(__dirname, "..", "assets"),
            common: path.join(__dirname, "..", "common"),
            modules: path.join(__dirname, "src", "modules"),
            app_shims: path.join(__dirname, "src", "app_shims"),
            node_shims: path.join(__dirname, "src", "node_shims")
        }
    }
});
