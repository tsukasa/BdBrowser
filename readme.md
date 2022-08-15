# BdBrowser
BdBrowser is an extension for your browser to load [BetterDiscord](https://github.com/BetterDiscord/BetterDiscord).

It is basically a simple NodeJS environment which allows BetterDiscord plugins to run within the web-client.

# Installation
Installation is done by downloading this repository as an ZIP archive, extracting the contents and loading the resulting folder as an unpacked extension in your browser while having developer mode enabled.

## Installing BdBrowser
Download the [current code as a zip archive](archive/refs/heads/master.zip) and unpack the folder within it to a destination of your choice.

Go to your [chrome://extensions](chrome://extensions) page, click this button and browse to the path you unpacked the archive to.

![image](https://user-images.githubusercontent.com/46447572/131920173-901089d2-6743-492b-ae9f-1bdcae7a35a5.png)

Now with the extension loaded and enabled, reload the [Discord](https://discordapp.com/channels/@me) tab. BetterDiscord should load and show the changelog.

## Updating BdBrowser
To update the extension, remove the extension through the [chrome://extensions](chrome://extensions) page and perform the same steps as for the installation (downloading a more recent copy of the source-code, unpack the zip archive etc.).

If you have loaded an unpacked version of the zip archive, you can manually replace the `dist/betterdiscord.js` file with a more recent version, in case that becomes necessary.

Please note that you will need to click the `Update` button on the extension page for Chrome to register the changes.

# Installing plugins/themes
You can install plugins/themes by pressing the `Open [...] Folder` button in the plugins/themes category of BetterDiscord's settings.

# Removing files from the virtual storage
Files are stored in a virtual storage structure within the site's local storage. This will make deleting them a bit harder, if things go awry.

In some rare cases you might want to remove orphaned or ill-behaving files from the extension's virtual storage but cannot find/uninstall them through BetterDiscord's settings.

You can peform these operations via your browser's developer tools console:

```
/* Read the contents of the virtual plugins folder */
require("fs").readdirSync(BdApi.Plugins.folder)
/* Removes the file named "SomePluginName.plugin.js" from the virtual plugins folder */
require("fs").unlinkSync(require("path").join(BdApi.Plugins.folder, "SomePluginName.plugin.js"))
```

Reload the Discord tab afterwards.
