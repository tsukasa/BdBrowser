# BdBrowser

BdBrowser is a Chrome extension that loads [BetterDiscord](https://github.com/BetterDiscord/BetterDiscord) in Discord's web client.

&nbsp;

## 🗺 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
  - [Installing Prebuilt Version](#installing-prebuilt-version)
  - [Building It Youself](#building-it-yourself)
- [Using BdBrowser](#-using-bdbrowser)
  - [Installing Plugins and Themes](#installing-plugins-and-themes)
  - [Updating Plugins or Themes](#updating-plugins-or-themes)
  - [Updating BdBrowser](#updating-bdbrowser)
  - [Uninstalling BdBrowser](#uninstalling-bdbrowser)
  - [Backing up the Virtual Filesystem](#backing-up-the-virtual-filesystem)
  - [Restoring from a Backup](#restoring-from-a-backup)
  - [Formatting the Virtual Filesystem](#formatting-the-virtual-filesystem)
  - [Deleting Files in the Virtual Filesystem](#deleting-files-in-the-virtual-filesystem)
  - [Restricting Extension Site Access](#restricting-extension-site-access)

&nbsp;

## 👁 Features

* [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) extension for [Chromium](https://www.chromium.org)-based browsers.
* Enables the use of [BetterDiscord](https://github.com/BetterDiscord/BetterDiscord)'s unmodified `renderer.js` in a web browser.
* Emulates a virtual filesystem in memory and persists changes in an IndexedDB.
  
  Plugins do not have access to your real filesystem.
* Service Worker handles outgoing web requests from BetterDiscord components to prevent CORS issues.
* Compatible with all BetterDiscord themes.
* Compatible with most&ast; BetterDiscord plugins.

&nbsp;

## 🛠 Installation

You can either use the ready-made files present in this repository or build BdBrowser yourself.
The latter is useful if you want to audit the code or make changes to it.

&nbsp;

### Installing Prebuilt Version

Installation is done by downloading this repository as a zip archive, extracting the contents of the archive and loading the resulting folder as an unpacked Chrome extension while developer mode is enabled:

1. Download the [current code as a zip archive](../../archive/refs/heads/master.zip).
2. Extract the zip archive, you should end up with a folder named `BdBrowser-master`.
3. Open your Chrome extensions page.
4. Make sure the "Developer mode" toggle on the extension page is enabled.
   This enables you to load unpacked extensions from a local folder.
5. Click the `Load unpacked` button in the toolbar:
   
   ![Load unpacked extension](assets/gh-readme/chrome-load-unpacked.png)
   
   Now select the `BdBrowser-master` folder from step 2.
6. Congratulations, you should see the extension loaded and working!
   [Discord](https://discord.com/channels/@me) tab. BetterDiscord should load and show the changelog.

&nbsp;

### Building It Yourself

Building BdBrowser yourself comes with a few prerequisites:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) with npm (included with Node.js, required for BdBrowser) and [pnpm](https://pnpm.io) (required for BetterDiscord)
- A terminal or command prompt

**Step 1: Clone the BdBrowser repository**

```sh
git clone https://github.com/tsukasa/BdBrowser.git BdBrowser
```

**Step 2: Install BdBrowser's dependencies**
```sh
cd BdBrowser
npm install
```

**Step 3: Build BdBrowser**
```sh
npm run prod
```

**Step 4: Clone the BetterDiscord repository**
```sh
cd ..
git clone https://github.com/BetterDiscord/BetterDiscord.git BetterDiscord
```

**Step 5: Install BetterDiscord's dependencies**
```sh
cd BetterDiscord
pnpm recursive install
```

**Step 6: Build BetterDiscord**
```sh
pnpm run build
```

**Step 7: Copy the BetterDiscord renderer to BdBrowser's `dist` directory**
```sh
cp ./dist/renderer.js ../BdBrowser/dist/betterdiscord.js
```

**Step 8: [Load the extension](#installing-prebuilt-version)**

&nbsp;

## 🎨 Using BdBrowser
Using BdBrowser is almost exactly the same as using BetterDiscord on your desktop.

### Installing Plugins and Themes
You can install plugins/themes by pressing the `Open [...] Folder` button in the plugins/themes
category of BetterDiscord's settings.

Instead of opening the folder containing your plugins/themes, a file picker will open.
Choose one or multiple files of the same type (plugins or themes).

The files will get installed into the virtual filesystem and will be available through their
respective category immediatly afterwards.

&nbsp;

### Updating Plugins or Themes
You can use the normal ways of updating plugins or themes:
* Use the Updater in the settings.
* Use plugin-specific update routines.
* Use the Plugin Repo or Theme Repo plugins.

Of course, you can also download a copy of the updated file manually and add it to the
virtual filesystem again. You do not need to remove the old file, following the instructions
for [installing plugins/themes](#installing-plugins-and-themes) automatically overwrites a
file if it already exists.

&nbsp;

### Updating BdBrowser
BetterDiscord or BdBrowser got updated? Then it might be time to update your local
BdBrowser installation.

Updating the extension is pretty much a repeat of [installing it](#installation) with a few
notable differences:

* Use the same folder as you did for the installation.
* You do not need to load the unpacked folder again because it is already loaded.
  Uninstalling the old version does not delete your BdBrowser settings or filesystem.
* Instead, please click the `Update` button on your Chrome extension page.
* After updating, please perform a hard reload of Discord's page (Shift + F5).

Note: Simply replacing the files/folder and restarting Chrome is _not_ sufficient.

&nbsp;

### Uninstalling BdBrowser
To uninstall BdBrowser, simply remove the extension as you would with every other
Chrome extension.

&nbsp;

### Backing up the Virtual Filesystem
Backups are great. You can download a serialized copy of your virtual filesystem
through the console:

```javascript
require("fs").exportVfsBackup();
```

&nbsp;

### Restoring from a Backup
If you made a [backup](#backing-up-the-virtual-filesystem) of your virtual filesystem,
you can restore it at any point.

Open the console and use the following command:
```javascript
require("fs").importVfsBackup();
```

A file picker will open. Choose a [backup](#backing-up-the-virtual-filesystem) file.

All files contained within the backup will be restored to the version serialized in
the backup. Files that do not exist in the backup stay untouched.

After importing the backup, please refresh the page.

&nbsp;

### Formatting the Virtual Filesystem
If you want to format the virtual filesystem and start over from scratch, you can
manually trigger this via the console:

```javascript
require("fs").formatVfs(true);
```

Entering this command will immediatly wipe the virtual filesystem.

Please reload the page after using the command.

&nbsp;

### Deleting Files in the Virtual Filesystem
In some rare cases you might want to remove orphaned or ill-behaving files from the extension's virtual filesystem
but cannot find/uninstall them through BetterDiscord's settings.

You can perform these operations via your browser's developer tools console:

```javascript
/* Read the contents of the virtual plugins folder */
require("fs").readdirSync(BdApi.Plugins.folder)
/* Removes the file named "SomePluginName.plugin.js" from the virtual plugins folder */
require("fs").unlinkSync(require("path").join(BdApi.Plugins.folder, "SomePluginName.plugin.js"))
```

Reload the Discord tab afterwards.

&nbsp;

### Restricting Extension Site Access
By default BdBrowser is allowed to read and change all your data on all sites through
the extension's "Site access" setting (accessible through Chrome's extension page and
clicking the Details button for an extension).

The default is set liberally so that all web requests handled by the service worker
will work out of the box. Otherwise, the user would manually have to configure
the allowed domains beforehand as part of the onboarding/installation.

If you know exactly which domains your specific set of themes/plugins query,
you can harden the configuration by changing the Site Access setting from
`On all sites` to `On specific sites` and adding the allowed domains manually.
