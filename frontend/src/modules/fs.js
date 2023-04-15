import DOM from "common/dom";
import Logger from "common/logger";
import Buffer from "./buffer"
import Events from "./events";
import VfsEntry from "./fsEntry";
import LocalStorage from "./localStorage";
import Path from "./path";
import Utilities from "./utilities";

// IndexedDB constants
const DB_NAME = "BdBrowser";
const DB_VERSION = 1;
const DB_STORE = "vfs";
const DB_DURABILITY = "relaxed"; // Possible values: default, relaxed, strict
const DB_FORCE_COMMIT = false;

/**
 * Name of the LocalStorage key that holds BdBrowser's virtual filesystem.
 * @type {string}
 */
const BD_FILES_KEY = "bd-files";

/**
 * Name of the LocalStorage key to check whether a migration from the LocalStorage
 * virtual filesystem is required/has been performed or not.
 * @type {string}
 * @see setBdBrowserFilesMigrated
 */
const BD_FILES_MIGRATED_KEY = "bd-files-migrated";

/**
 * Name of the LocalStorage key that holds BdBrowser's VFS version.
 * @type {string}
 */
const BD_VFS_VERSION_KEY = "bd-vfs-version";

/**
 * BdBrowser Virtual Filesystem version.
 * Increase this value when making (breaking) changes to the VFS.
 * @type {number}
 */
const BD_VFS_VERSION = 2;

/**
 * List of virtual folders to initialize on a fresh installation.
 * @type {string[]}
 */
const VFS_FOLDERS_TO_INITIALIZE = [
    "AppData",
    "AppData/BetterDiscord",
    "AppData/BetterDiscord/plugins",
    "AppData/BetterDiscord/themes",
    "AppData/BetterDiscord/data"
];

const FILE_REGEX = /\.(.+)$/;

const emitter = new Events();

/**
 * Global handle of the IndexedDB database connection.
 */
let database;

/**
 * Global holder for initialization status.
 * @type {boolean}
 */
let initialized = false;

/**
 * Global handle of the memory cache.
 * @type {{data: VfsEntry}}
 */
let cache = {
    data: {}
}

/*---------------------------------------------------------------------------*/
/* Helper Functions from original fs.js                                      */
/*---------------------------------------------------------------------------*/

/**
 * Returns the last portion of a path, similar to the Unix basename command.
 * Deprecated, use {@link path.basename} instead if you have an already normalized path!
 * @param {string} path - Path to break and parse.
 * @returns {string} Last portion of the given input path.
 * @deprecated
 */
export function basename(path) {
    if (typeof(path) !== "string") {
        throw Object.assign(new TypeError(`The "path" argument must be of type string. Received ${typeof (path)}.`), {
            code: "ERR_INVALID_ARG_TYPE",
        });
    }

    return path.split(/\/|\\/).pop();
}

/**
 * Checks whether a given input filename is considered a file or not.
 * @param {string} name - Filename to check.
 * @returns {boolean} Result of evaluation.
 */
function isFile(name) {
    return FILE_REGEX.test(name);
}

/**
 * Normalizes a given input path by converting backslashes to slashes
 * and removing leading/trailing slashes.
 * @param {string} path - Path to normalize.
 * @returns {string} Normalized path or empty string if no path was supplied.
 */
export function normalizePath(path) {
    if(!path)
        return "";

    let normalizedPath = path;
    normalizedPath = normalizedPath.replace(/\\/g, "/"); // Convert backslashes to slashes
    normalizedPath = normalizedPath.replace(/^\/|\/$/g, ""); // Remove slashes in front/back
    return normalizedPath;
}

/*---------------------------------------------------------------------------*/
/* General VFS Functions                                                     */
/*---------------------------------------------------------------------------*/

/**
 * Exports the current contents of the virtual file system as a serialized JSON file.
 * @see importVfsBackup
 */
function exportVfsBackup() {
    let vfsList = {};
    let execDate = new Date()
        .toISOString()
        .replace(":", "-")
        .replace(".", "-");

    for (const fullName of Object.keys(cache.data)) {
        // Must be a deep copy, otherwise the source object will take damage!
        let o = Object.assign(new VfsEntry(fullName, cache.data[fullName].nodeType), cache.data[fullName]);

        if(o.nodeType === "dir")
            o.contents = undefined;

        if(o.nodeType === "file" && o.contents)
            o.contents = Utilities.arrayBufferToBase64(cache.data[fullName].contents);

        vfsList[fullName] = o;
    }

    let jsonString = JSON.stringify(vfsList);

    let a = DOM.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([jsonString], {type: "application/json"}));
    a.download = `bdbrowser_backup_${execDate}.json`;
    a.click();
    a.remove();
}

/**
 * "Formats" the virtual file system and re-initializes it with the base directory structure.
 * @param {boolean} userIsSure Signals that the user is sure they want to format the virtual file system.
 */
function formatVfs(userIsSure) {
    if(userIsSure === true) {
        Logger.log("VFS", "Formatting VFS and initializing base data...");

        for(const fullName of Object.keys(cache.data)) {
            removeFromVfsCache(fullName);
            removeIndexedDbKey(fullName);
        }

        initializeBaseData();
    }
    else
    {
        Logger.info("VFS", "If you are sure you want to format the VFS, please call the function like this: fs.formatVfs(true);")
    }
}

/**
 * Imports a serialized JSON backup of the virtual file system.
 * Existing files that are not present in the backup will be kept in place.
 * @see exportVfsBackup
 */
function importVfsBackup() {
    let i = DOM.createElement("input", {type: "file"});
    i.addEventListener("change", () => {
        for (const file of i.files) {
            const reader = new FileReader();
            reader.onload = () => {
                Logger.log("VFS", "Import from backup.");
                let backupData = JSON.parse(reader.result);

                for(const fullName of Object.keys(backupData)) {
                    let o = Object.assign(new VfsEntry(fullName, backupData[fullName].nodeType), backupData[fullName]);

                    if(o.nodeType === "dir")
                        o.contents = undefined;

                    if(o.nodeType === "file" && o.contents)
                        o.contents = Utilities.base64ToArrayBuffer(o.contents);

                    Logger.log("VFS", `Restoring from backup: ${o.fullName}`);

                    writeOrUpdateMemoryCache(o.fullName, o);
                    writeOrUpdateIndexedDbKey(o.fullName, o);
                }
                Logger.log("VFS", "Import finished.");
            };
            reader.readAsText(file);
        }
    });
    i.click();
    i.remove();
}

/**
 * Returns the version of BdBrowser's VFS according to the LocalStorage.
 * @see setBdBrowserVfsVersion
 * @returns {number|undefined} VFS version according to LocalStorage key.
 */
function getBdBrowserVfsVersion() {
    return LocalStorage.getItem(BD_VFS_VERSION_KEY) || 0;
}

/**
 * Returns the accumulated size of all files in the VFS.
 * @returns {number} - Size of all files in bytes.
 */
function getVfsSizeInBytes() {
    let totalSize = 0;
    let fileSizes = [];

    for (const key of Object.keys(cache.data)) {
        if(cache.data[key].nodeType === "file")
        {
            totalSize += cache.data[key].size;
            fileSizes.push({fullName: key, size: cache.data[key].size });
        }
    }

    fileSizes.sort((l, r) => (l.size < r.size ? 1 : -1));

    console.log(fileSizes);
    return totalSize;
}

/**
 * Checks whether the LocalStorage contains the key carrying the virtual filesystem.
 * @returns {boolean}
 */
function hasBdBrowserFiles() {
    let bdFilesItem = LocalStorage.getItem(BD_FILES_KEY);
    return (bdFilesItem !== undefined);
}

/**
 * Checks whether the LocalStorage key for the migration is present and set to `true`.
 * @returns {boolean}
 */
function hasBeenMigrated() {
    let wasMigrated = LocalStorage.getItem(BD_FILES_MIGRATED_KEY);
    return wasMigrated === true;
}

/**
 * This function starts the migration of an existing BdBrowser virtual filesystem
 * from the LocalStorage into the new IndexedDB backend. Calls
 * {@link importLocalStorageNode} to do all the heavy lifting.
 * @see importLocalStorageNode
 * @returns {Promise<boolean>} - Migration successful
 */
function importFromLocalStorage() {
    return new Promise(resolvePromise => {
        // Make sure we start on an empty stomach.
        // Note: This only clears the MEMORY cache, the database is specifically
        // _not_ being emptied. Import overwrites conflicting entries in the database
        // but leaves existing ones that are not part of the LocalStorage alone.
        emptyVfsCache();

        let localStorageData = LocalStorage.getItem(BD_FILES_KEY);
        if(!localStorageData)
        {
            setBdBrowserVfsVersion(BD_VFS_VERSION);
            resolvePromise(false);
            return;
        }

        Logger.log("VFS", "Migrating existing data from Local Storage into IndexedDB...");
        const startTime = performance.now();

        let localStorageJson = Object.assign({}, JSON.parse(localStorageData));

        // Skip the root node; directly start in "files" so there are keys to evaluate!
        importLocalStorageNode(localStorageJson.files);

        setBdBrowserVfsVersion(BD_VFS_VERSION);
        setBdBrowserFilesMigrated();

        const endTime = performance.now();
        Logger.log("VFS", `Migration of existing data complete, took ${(endTime - startTime).toFixed(2)}ms.`);
        initialized = true;
        resolvePromise(true);
    });
}

/**
 * Recursively imports files and folders from a BdBrowser LocalStorage JSON object
 * into the IndexedDB database by pushing them into the memory cache.
 * @see importFromLocalStorage
 * @param {object[]} vfsObject - Array of objects representing files or folders.
 * @param {string} parentPath - Absolute path of the parent that called this function.
 */
function importLocalStorageNode(vfsObject, parentPath = "") {
    for(let vfsObjectKey in vfsObject) {
        if(!vfsObject[vfsObjectKey].type)
            continue;

        switch(vfsObject[vfsObjectKey].type) {
            case "file":
                let fileName = normalizePath(parentPath.concat("/", vfsObjectKey));
                writeFileSync(fileName, vfsObject[vfsObjectKey].content);
                break;

            case "dir":
                let folderName = normalizePath(parentPath.concat("/", vfsObjectKey));
                mkdirSync(folderName);

                // Recursively process all child folders, dive straight into "files"!
                importLocalStorageNode(vfsObject[vfsObjectKey].files, folderName);
                break;
        }
    }
}

/**
 * Creates the base directories for a fresh VFS and sets the migrated flag.
 * @see VFS_FOLDERS_TO_INITIALIZE
 * @see setBdBrowserFilesMigrated
 * @return {Promise<boolean>} - Value indicating that base data was initialized.
 */
function initializeBaseData() {
    return new Promise(resolvePromise => {
        Logger.log("VFS", "Creating base VFS for fresh installation.");

        emptyVfsCache();

        VFS_FOLDERS_TO_INITIALIZE.forEach(folder => mkdirSync(folder));

        setBdBrowserVfsVersion(BD_VFS_VERSION);
        setBdBrowserFilesMigrated();

        Logger.log("VFS", "Base VFS structure created!");
        initialized = true;
        resolvePromise(true);
    });
}

/**
 * Returns whether the VFS has been initialized or not.
 * @returns {boolean} - Boolean indicating whether VFS is initialized or not.
 */
export function isVfsInitialized() {
    return initialized;
}

/**
 * Initializes the VFS after the database connection is established.
 * This function automatically determines whether existing data should be
 * migrated from the LocalStorage virtual filesystem or a regular VFS
 * memory cache fill is in order.
 * @returns {Promise<boolean>} - Boolean indicating whether operation was successful.
 */
export function initializeVfs() {
    return new Promise(resolvePromise => {
        if(!hasBeenMigrated())
            if(hasBdBrowserFiles())
                resolvePromise(importFromLocalStorage());
            else
                resolvePromise(initializeBaseData());
        else
            resolvePromise(fillMemoryCacheFromIndexedDb());
    });
}

/**
 * Sets the LocalStorage migration key to either `true` or the specified value.
 * @param {boolean} value - Boolean to set the value of the key to.
 * @see BD_FILES_MIGRATED_KEY
 */
function setBdBrowserFilesMigrated(value = true) {
    LocalStorage.setItem(BD_FILES_MIGRATED_KEY, value);
}

/**
 * Sets the LocalStorage VFS version key.
 * @see BD_VFS_VERSION
 * @param {number} version - New version of the VFS.
 */
function setBdBrowserVfsVersion(version) {
    LocalStorage.setItem(BD_VFS_VERSION_KEY, version);
}

/**
 * Internal maintenance function to service VFS objects and perform updates.
 * Called during {@link initializeVfs} if {@link BD_VFS_VERSION} is greater
 * than the return value of {@link getBdBrowserVfsVersion}.
 */
function upgradeVfsData() {
    const textEncoder = new TextEncoder();
    const propertiesToRemove = [
        "mimeType", // 2022-09-04, Will be determined dynamically if needed.
        "fileName", // 2022-09-04, Derived from path.basename(fullName) now.
    ];

    Logger.log("VFS", "Running VFS maintenance...");

    for (const [key, value] of Object.entries(cache.data)) {
        let vfsObject = new VfsEntry(value.fullName, value.nodeType);
        let hasChanged = false;

        vfsObject = Object.assign(vfsObject, value);

        // --------------------------------------------------------------------
        // Remove obsolete metadata entries to keep things orderly            |
        // --------------------------------------------------------------------

        if(Object.getOwnPropertyNames(vfsObject).some((e) => propertiesToRemove.includes(e)))
        {
            console.log(`❌ Removing obsolete VFS metadata for: ${vfsObject.fullName}.`);

            propertiesToRemove.forEach(prop => {
                if(vfsObject.hasOwnProperty(prop)) {
                    console.log(`  Removing property "${prop}".`)
                    delete vfsObject[prop];
                    hasChanged = true;
                }
            });
        }

        // --------------------------------------------------------------------
        // Migrate between string and UInt8Array for content storage          |
        // --------------------------------------------------------------------

        if(vfsObject.nodeType === "file" && vfsObject.contents.constructor.name === "String") {
            console.log(`♻ Converting "contents" from String to Uint8Array for: ${vfsObject.fullName}.`);
            vfsObject.contents = textEncoder.encode(vfsObject.contents);
            vfsObject.size = vfsObject.contents.byteLength;
            hasChanged = true;
        }

        // --------------------------------------------------------------------
        // Finished processing single VFS entry                               |
        // --------------------------------------------------------------------

        if(hasChanged)
        {
            console.log("✅ Committing entry to data store.");
            writeOrUpdateMemoryCache(key, vfsObject);
            writeOrUpdateIndexedDbKey(key, vfsObject);
        }
    }

    setBdBrowserVfsVersion(BD_VFS_VERSION);

    Logger.log("VFS", "Maintenance complete.");
    Logger.log("VFS", `VFS is now at version ${BD_VFS_VERSION}.`);
}

/*---------------------------------------------------------------------------*/
/* Local Memory Cache Functions                                              */
/*---------------------------------------------------------------------------*/

// noinspection JSUnusedLocalSymbols
/**
 * Dumps the contents of the memory cache into the console for easier
 * debugging.
 * @returns {{data: VfsEntry[]}}
 */
export function dumpVfsCache() {
    return cache.data;
}

/**
 * Clears/empties the internal memory cache without replicating the changes
 * to the database.
 * Should only be used by the bootstrapping and migration functions.
 */
function emptyVfsCache() {
    cache.data = [];
}

/**
 * Returns either an {@link object} from the internal memory cache
 * or the value of the given prop parameter.
 * @see removeFromVfsCache
 * @param {string} path - Key of the VFS entry to query.
 * @param {string} [prop] - Optional name of property.
 * @returns {undefined|VfsEntry|*}
 */
function getVfsCacheEntry(path, prop) {
    if(cache.data[path]) {
        // No property defined, return entire object.
        if(!prop)
            return cache.data[path];

        if(cache.data[path].hasOwnProperty(prop))
            return cache.data[path][prop];
    }
}

/**
 * Removes an entry from the internal memory cache without replicating the
 * change to the database.
 * @see getVfsCacheEntry
 * @see writeOrUpdateMemoryCache
 * @param {string} path - Key of the VFS entry to remove
 */
function removeFromVfsCache(path) {
    path = normalizePath(path);
    if(cache.data[path])
        delete cache.data[path];
}

/**
 * Writes/updates the internal memory cache without replicating the change
 * to the database. _If_ you have to meddle with the cache,
 * please use this function.
 * @see writeInternalVfsCacheEntry
 * @see removeFromVfsCache
 * @param {string} path - Key of the VFS entry to update
 * @param {VfsEntry} vfsEntryObject - New values for the VFS entry. Replaces the old object.
 */
function writeOrUpdateMemoryCache(path, vfsEntryObject) {
    path = normalizePath(path);
    cache.data[path] = vfsEntryObject;
}

/**
 * Simple implementation of an inotify function to dispatch events about
 * changes in the filesystem to subscribed listeners.
 * Recursively works its way up the root directory from the original emitter.
 * @see watch
 * @param {string} path - Absolute path of a file/directory to dispatch an event for.
 * @param {string} event - The event to dispatch (i.e. "change" or "rename").
 * @param {string} [source] - Used on recursive calls to denote the caller.
 */
function inotify(path, event, source) {
    let parent = Path.dirname(path);
    let newSource = Path.basename(path);

    // Initially, the {source} parameter should not be supplied when
    // calling inotify. It is intended for recursive calls made from
    // within the function.
    if(!source)
        source = Path.basename(path);

    // The structure for the calls looks like this for creating a new file:
    // (Assuming we work with AppData/BetterDiscord/data/MyFile.txt)
    // 0: Path: MyFile.txt,    Source: MyFile.txt,    Event: rename
    // 1: Path: data,          Source: MyFile.txt,    Event: rename
    // 2: Path: BetterDiscord, Source: data,          Event: change (!)
    // 3: Path: AppData,       Source: BetterDiscord, Event: change (!)
    // So unless we are directly dealing with the file or its host directory,
    // we change the "rename" to a "change" to signal metadata change because
    // rename has a different use for directories (creating/deleting).
    if(!isFile(source) && Path.basename(path) !== source)
        event = "change";

    emitter.emit(path, source, event);

    if(parent.length > 0)
        inotify(parent, event, newSource);
}

/*---------------------------------------------------------------------------*/
/* fs Functions                                                              */
/*---------------------------------------------------------------------------*/

/**
 * Test whether the given path exists by checking with the file system.
 * Then call the callback argument with either true or false.
 * @param {string} path - Path to test.
 * @param {function} callback - Callback function to execute.
 */
export function exists(path, callback) {
    let v = existsSync(path);
    callback(v);
}

export function existsSync(path) {
    try {
        path = normalizePath(path);
        let stats = statSync(path);
        return stats.isFile() || stats.isDirectory();
    } catch (e) {
        return false;
    }
}

/**
 * Returns a new {@link Error} object for a known list of filesystem error codes.
 * @param {object} params - Object containing the parameters for the error message.
 * @returns {(Error & {syscall: string, path: string, errno: number, code: string})|any}
 */
function getVfsErrorObject(params) {
    let errno = undefined;
    let msg = undefined;
    let code = undefined;
    let path = (params.dest) ? `'${params.path}' -> '${params.dest}'` : `'${params.path}'`;

    switch(params.error) {
        case "EACCES":
            code = "EACCES";
            errno = -13;
            msg = `${code}: permission denied, ${params.syscall} ${path}`;
            break;

        case "EEXIST":
            code = "EEXIST";
            errno = -4075;
            msg = `${code}: file already exists, ${params.syscall} ${path}`;
            break;

        case "EISDIR":
            code = "EISDIR";
            errno = -4068;
            msg = `${code}: illegal operation on a directory, ${params.syscall} ${path}`
            break;

        case "ENOENT":
            code = "ENOENT";
            errno = -4058;
            msg = `${code}: no such file or directory, ${params.syscall} ${path}`;
            break;

        case "ENOTDIR":
            code = "ENOTDIR";
            errno = -4052;
            msg = `${code}: not a directory, ${params.syscall} ${path}`;
            break;

        case "ENOTEMPTY":
            code = "ENOTEMPTY";
            errno = -4051;
            msg = `${code}: directory not empty, ${params.syscall} ${path}`;
            break;

        case "EPERM":
            code = "EPERM";
            errno = -4048;
            msg = `${code}: operation not permitted, ${params.syscall} ${path}`;
            break;

        default:
            return Object.assign(new Error(`Unknown getVfsErrorObject error provided: ${params.error}, ${params.syscall}`));
    }

    return Object.assign(new Error(msg), {
        errno: errno,
        syscall: params.syscall,
        code: code,
        path: params.path,
        dest: params.dest,
    });
}

export function statSync(path) {
    path = normalizePath(path);

    let fsEntry = getVfsCacheEntry(path);

    if (fsEntry?.nodeType !== "file" && fsEntry?.nodeType !== "dir")
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "stat" });

    return {
        birthtime: new Date(fsEntry.birthtime),
        atime: new Date(fsEntry.atime),
        ctime: new Date(fsEntry.ctime),
        mtime: new Date(fsEntry.mtime),
        birthtimeMs: fsEntry.birthtime,
        atimeMs: fsEntry.atime,
        ctimeMs: fsEntry.ctime,
        mtimeMs: fsEntry.mtime,
        size: fsEntry.size,
        uid: 1001,
        gid: 1001,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isDirectory: () => fsEntry.nodeType === "dir",
        isFIFO: () => false,
        isFile: () => fsEntry.nodeType === "file",
        isSocket: () => false,
        isSymbolicLink: () => false,
    };
}

export function mkdir(path, options, callback) {
    if (typeof (options) === "function") {
        callback = options;
        options = {};
    }

    try {
        let v = mkdirSync(path, options);
        callback(v);
    } catch {
        callback();
    }
}

export function mkdirSync(path, options) {
    path = normalizePath(path);
    let parentPath = Path.dirname(path);
    let firstPathElementCreated;

    if(!options)
        options = { recursive: false };

    if(existsSync(path))
        throw getVfsErrorObject({ path: path, error: "EEXIST", syscall: "mkdir" });

    if(options.recursive === true) {
        let pathElements = path.split("/");
        let pathCrumb = "";

        // Remove last item, will be created by the regular (non-recursive) logic.
        pathElements.pop();

        pathElements.forEach(element => {
            pathCrumb = normalizePath(pathCrumb.concat("/", element));
            try {
                mkdirSync(pathCrumb, { recursive: false });

                // If mkdirSync was successful and this is the first element
                // this loop was able to create, remember it for later return.
                if(!firstPathElementCreated)
                    firstPathElementCreated = pathCrumb;
            } catch (e) {
                // Ignore exceptions here, they are likely EEXIST errors.
            }
        });
    }

    // Parent directory needs to exist, unless it is the root.
    if(parentPath.length > 0 && !existsSync(parentPath))
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "mkdir" });

    // Uniform Date.now() for all fs timestamps
    let dateNow = Date.now();

    let objDir = Object.assign(new VfsEntry(path, "dir"), {
        /* Node Information */
        birthtime: dateNow,
        atime: dateNow,
        ctime: dateNow,
        mtime: dateNow,
        /* Content Information */
        contents: undefined,
        size: 0
    });

    writeOrUpdateMemoryCache(path, objDir);
    writeOrUpdateIndexedDbKey(path, objDir);
    inotify(path, "rename");

    if(options.recursive === true)
        return firstPathElementCreated || path;
}

export function readdirSync(path) {
    path = normalizePath(path);
    let found = [];

    // Check if element exists at all
    if(!existsSync(path))
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "scandir" });

    // Check if element is a directory
    let stat = statSync(path);

    if(!stat.isDirectory())
        throw getVfsErrorObject({ path: path, error: "ENOTDIR", syscall: "scandir" });

    // Find other elements that reside within this element.
    for(let dataKey in cache.data) {
        let fsEntry = getVfsCacheEntry(dataKey);
        if(fsEntry.pathName === path) {
            found.push(Path.basename(fsEntry.fullName));
        }
    }

    return found.sort();
}

export function readFile(path, options, callback) {
    if (typeof (options) === "function") {
        callback = options;
        options = {};
    }

    try {
        let data = readFileSync(path, options);
        callback(undefined, data);
    } catch (e) {
        callback(e, undefined);
    }
}

export function readFileSync(path, options) {
    path = normalizePath(path);

    if(!options)
        options = { encoding: null };
    else if(typeof(options) === "string")
        options = { encoding: options };

    let fsEntry = getVfsCacheEntry(path);

    if(!fsEntry)
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "open" });

    if(options.encoding) {
        let textDecoder = new TextDecoder(options.encoding);
        // Call toString() - otherwise it is a DOMString!
        return textDecoder.decode(fsEntry.contents).toString();
    } else {
        return new Buffer(fsEntry.contents);
    }
}

/**
 * Internal function that removes a node (file or directory) from the VFS.
 * Used by {@link unlinkSync}, {@link rmSync} and {@link rmdirSync}.
 * @param {string} path - Path to remove
 * @param {object} [options] - Options for removal
 * @returns {undefined}
 */
function removeFileOrDirectory(path, options) {
    path = normalizePath(path);

    if(!options)
        options = { recursive: false, force: false };

    // The very last fail-safe.
    if(!existsSync(path))
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "rm" });

    let stat = statSync(path);

    if(stat.isFile())
    {
        removeFromVfsCache(path);
        removeIndexedDbKey(path);
        /* Disable inotify for renameSync shenanigans */
        if(!options.disableInotify || options.disableInotify === false)
            inotify(path, "rename");
    }
    else
    {
        if(options.recursive === true)
        {
            for(let vfsObject in cache.data) {
                let vfsEntry = getVfsCacheEntry(vfsObject);

                if (vfsEntry.pathName.startsWith(path))
                {
                    removeFileOrDirectory(vfsEntry.fullName, { recursive: options.recursive, force: options.force });
                }
            }
        }
        removeFromVfsCache(path);
        removeIndexedDbKey(path);
        inotify(path, "rename");
    }
}

export function rm(path, options, callback) {
    if (typeof (options) === "function") {
        callback = options;
        options = {};
    }

    try {
        rmSync(path, options);
        callback();
    } catch (e) {
        callback(e);
    }
}

export function rmSync(path, options) {
    path = normalizePath(path);

    if(!options)
        options = { recursive: false, force: false };

    try {
        if(!existsSync(path)) {
            // noinspection ExceptionCaughtLocallyJS
            throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "rm" });
        }

        let stat = statSync(path);
        if(stat.isDirectory() && options.recursive !== true && readdirSync(path).length > 0) {
            // noinspection ExceptionCaughtLocallyJS
            throw getVfsErrorObject({ path: path, error: "ENOTEMPTY", syscall: "rm" });
        }

        removeFileOrDirectory(path, { recursive: options.recursive, force: options.force });
    } catch (e) {
        if(options.force !== true)
            throw e;
    }
}

export function rmdir(path, options, callback) {
    if (typeof (options) === "function") {
        callback = options;
        options = {};
    }

    try {
        rmdirSync(path, options);
        callback();
    } catch (e) {
        callback(e);
    }
}

export function rmdirSync(path, options) {
    path = normalizePath(path);

    if(!options)
        options = { recursive: false };

    if(!existsSync(path) || !statSync(path).isDirectory())
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "rmdir" });

    if(options.recursive !== true && readdirSync(path).length > 0)
        throw getVfsErrorObject({ path: path, error: "ENOTEMPTY", syscall: "rmdir" });

    removeFileOrDirectory(path, { recursive: options.recursive, force: false });
}

/**
 * Renames a file within the VFS.
 * Requires absolute paths to be passed.
 * @param {string} oldPath - Old absolute path
 * @param {string} newPath - New absolute path
 */
export function renameSync(oldPath, newPath) {
    if(!existsSync(oldPath))
        throw getVfsErrorObject({ path: oldPath, dest: newPath, error: "ENOENT", syscall: "rename" });

    /* TODO: We can only process files at the moment */
    if (!isFile(oldPath))
        throw getVfsErrorObject({ path: newPath, error: "EPERM", syscall: "rename" });

    let oldContent = readFileSync(oldPath);

    /* Perform writeFileSync and removeFileOrDirectory with inotify disabled. */
    /* Otherwise, BetterDiscord will try to process the file multiple times.   */
    writeFileSync(newPath, oldContent, { _disableInotify: true });
    removeFileOrDirectory(oldPath, { recursive: false, force: false, disableInotify: true });
    inotify(newPath, "rename");
}

/**
 * Asynchronously renames a file within the VFS.
 * @param {string} oldPath - Old absolute path
 * @param {string} newPath - New absolute path
 * @param {function} callback - Callback function
 */
export function rename(oldPath, newPath, callback) {
    try {
        renameSync(oldPath, newPath);
        callback();
    } catch (e) {
        callback(e);
    }
}

/**
 * Asynchronously removes a file or symbolic link. No arguments other than a
 * possible exception are given to the completion callback.
 * @see unlinkSync
 * @param {string} path - Path to the file to remove.
 * @param {function} callback - Callback function.
 */
export function unlink(path, callback) {
    try {
        unlinkSync(path);
        callback();
    } catch (e) {
        callback(e);
    }
}

/**
 * Synchronous unlink.
 * @see unlink
 * @param {string} path - Path to the file to remove.
 */
export function unlinkSync(path) {
    path = normalizePath(path);

    if(!existsSync(path))
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "unlink" });

    if(!statSync(path).isFile())
        throw getVfsErrorObject({ path: path, error: "EPERM", syscall: "unlink" });

    removeFileOrDirectory(path, { recursive: false, force: false });
}

export function watch(path, options, listener) {
    if (typeof (options) === "function") {
        listener = options;
        options = {};
    }

    const callback = (path, type) => {
        listener(type, path);
    };

    emitter.on(path, callback);

    return {
        close: () => emitter.off(path, callback)
    };
}

export function writeFile(path, content, options, callback) {
    if (typeof (options) === "function") {
        callback = options;
        options = {};
    }

    try {
        writeFileSync(path, content);
        callback();
    } catch(e) {
        callback(e);
    }
}

export function writeFileSync(path, content, options) {
    path = normalizePath(path);
    let filename = Path.basename(path);
    let encodedContent = new Buffer([]);

    // TODO: No idea how that would work right now...
    if(!options)
        options = { encoding: "utf-8" };
    else if(typeof(options) === "string")
        options = { encoding: options };

    if(existsSync(path) && statSync(path).isDirectory())
        throw getVfsErrorObject({ path: path, error: "EISDIR", syscall: "open" });

    // TODO: Not a clean solution.
    if (!isFile(filename))
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "open" });

    if (!existsSync(Path.dirname(path)))
        throw getVfsErrorObject({ path: path, error: "ENOENT", syscall: "open" });

    // In case the file already exists, some metadata can be pulled for re-use.
    let currentBirthtime = getVfsCacheEntry(path, "birthtime");

    // Uniform Date.now() for all fs timestamps
    let dateNow = Date.now();

    if(typeof(content) === "string")
        encodedContent = new TextEncoder().encode(content)
    else
        encodedContent = content;

    let objFile = Object.assign(new VfsEntry(path, "file"), {
        /* Node Information */
        birthtime: (currentBirthtime) ? currentBirthtime : dateNow,
        atime: dateNow,
        ctime: dateNow,
        mtime: dateNow,
        /* Content Information */
        contents: encodedContent,
        size: encodedContent.byteLength,
    });

    writeOrUpdateMemoryCache(path, objFile);
    writeOrUpdateIndexedDbKey(path, objFile);

    /* Disable inotify for renameSync shenanigans */
    if(!options._disableInotify || options._disableInotify === false)
        inotify(path, "change");
}

/*---------------------------------------------------------------------------*/
/* IndexedDB Functions                                                       */
/*---------------------------------------------------------------------------*/

/**
 * Returns an object store for the BdBrowser VFS store with the requested
 * transaction mode.
 * @param {string} [mode="readwrite"] - Transaction mode
 * @returns {IDBObjectStore} - Object store
 */
function getObjectStore(mode = "readwrite") {
    let txOptions = { durability: DB_DURABILITY }
    let transaction = database.transaction(DB_STORE, mode, txOptions);

    transaction.onabort = function() {
        Logger.error("VFS", "Transaction aborted:", transaction.error);
    }

    transaction.oncomplete = function() {

    }

    transaction.onerror = function() {
        Logger.error("VFS", "Transaction error:", transaction.error);
    }

    return transaction.objectStore(DB_STORE);
}

/**
 * Ensures an IndexedDB database connection is present.
 * Will perform the required creation/upgrade of the schema.
 * Promise is only resolved on success in order to block execution flow.
 * @returns {Promise<boolean>} - Value indicating whether database connection is alive.
 */
function openDatabase() {
    return new Promise((resolvePromise, rejectPromise) => {
        let request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onsuccess = function (event) {
            Logger.log("VFS", "Database connection established.");
            database = event.target.result;
            resolvePromise(true);
        }

        request.onclose = function() {
            Logger.log("VFS", "Database connection closed.");
            database = undefined;
        }

        request.onerror = function (e) {
            Logger.error("VFS", "Could not establish database connection:", request.error);
            rejectPromise(e);
        }

        request.onversionchange = function () {
            Logger.log("VFS", "Database version changed.");
        }

        request.onupgradeneeded = function (event) {
            event.currentTarget.result.createObjectStore(DB_STORE, { keyPath: "fullName" });
            Logger.log("VFS", "Database upgrade performed.");
        }
    });
}

/**
 * Performs the initial flood fill of the memory cache with data from
 * the IndexedDB.
 * @return {Promise<boolean>} - Value indicating that cache was filled.
 */
function fillMemoryCacheFromIndexedDb() {
    return new Promise((resolvePromise, rejectPromise) => {
        if (!database)
            throw new Error("Database not connected!");

        Logger.log("VFS", "Pre-caching data from IndexedDB...");
        const startTime = performance.now();

        let store = getObjectStore("readonly");
        let vfsEntries = store.getAll();

        vfsEntries.onsuccess = function (event) {
            let cursor = event.target.result;
            cursor.forEach(entry => {
                cache.data[entry.fullName] = Object.assign(new VfsEntry(entry.fullName, entry.nodeType), entry);
            });

            // Once the cache has been populated, run required maintenance
            // work on the system. Has to happen before any logic uses
            // readFileSync() or writeFileSync() because they might fail.
            if(getBdBrowserVfsVersion() < BD_VFS_VERSION)
                upgradeVfsData();

            const endTime = performance.now();
            Logger.log("VFS", `Memory cache populated, took ${(endTime - startTime).toFixed(2)}ms. VFS is ready.`);
            initialized = true;
            resolvePromise(true);
        }

        vfsEntries.onerror = function (e) {
            Logger.error("VFS", "Error during fillMemoryCacheFromIndexedDb:", vfsEntries.error);
            rejectPromise(e);
        }
    });
}

/**
 * Removes a given fullName key in the IndexedDB.
 * @param {string} fullNameKey - fullName key of the object to remove.
 */
function removeIndexedDbKey(fullNameKey) {
    if(!database)
        throw new Error("Database not connected!");

    let store = getObjectStore();
    let res = store.delete(fullNameKey);

    res.onsuccess = function() {
        if(DB_FORCE_COMMIT)
            store.transaction.commit();
    }

    res.onerror = function() {
        Logger.error("VFS", "Error while removeIndexedDbKey:", res.error);
    }
}

/**
 * Sets or updated a given fullNameKey in the IndexedDB with the new object
 * given in the vfsEntryObject parameter.
 * @param {string} fullNameKey - fullName key of the object to update.
 * @param {VfsEntry} vfsEntryObject - Object representing a file or folder.
 */
function writeOrUpdateIndexedDbKey(fullNameKey, vfsEntryObject) {
    if(!database)
        throw new Error("Database not connected!");

    let store = getObjectStore();
    let res = store.put(vfsEntryObject);

    res.onsuccess = function() {
        if(DB_FORCE_COMMIT)
            store.transaction.commit();
    }

    res.onerror = function() {
        Logger.error("VFS", "Error while writeOrUpdateIndexedDbKey:", res.error);
    }
}

const fs = {
    /* vfs-specific */
    dumpVfsCache,
    exportVfsBackup,
    formatVfs,
    getVfsCacheEntry,
    getVfsSizeInBytes,
    importVfsBackup,
    initializeVfs,
    isVfsInitialized,
    openDatabase,
    /* tooling */
    basename,
    normalizePath,
    /* fs */
    exists,
    existsSync,
    mkdir,
    mkdirSync,
    readFile,
    readFileSync,
    readdirSync,
    realpathSync: normalizePath,
    rename,
    renameSync,
    rm,
    rmSync,
    rmdir,
    rmdirSync,
    statSync,
    unlink,
    unlinkSync,
    watch,
    writeFile,
    writeFileSync
}

export default fs;
