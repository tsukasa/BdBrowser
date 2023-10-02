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
        filename: "backend.js",
        path: path.resolve(__dirname, "..", "dist", "js")
    },
    resolve: {
        extensions: [".js", ".jsx"],
        modules: [
            path.resolve(__dirname, "src", "modules")
        ],
        alias: {
            common: path.join(__dirname, "..", "common"),
            assets: path.join(__dirname, "..", "assets")
        }
    }
});
