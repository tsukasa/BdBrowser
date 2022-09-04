import Events from "./events";
import * as Path from "./path";
import {getItem, setItem} from "./localStorage";
import Logger from "common/logger";
import VfsBuffer from "./fsBuffer";
import VfsEntry from "./fsEntry";

// IndexedDB constants
const DB_NAME = "BdBrowser";
const DB_VERSION = 1;
const DB_STORE = "vfs";
const DB_DURABILITY = "relaxed"; // Possible values: default, relaxed, strict
const DB_FORCE_COMMIT = false;

// Strencher's return values for fs functions
// TODO: Get rid of this, replace with proper Node-like handling!
const NOT_FOUND = "NOT_FOUND";
const NOT_A_DIR = "NOT_A_DIR";

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

let database;
let cache = {
    data: {}
}

/*---------------------------------------------------------------------------*/
/* Helper Functions from original fs.js                                      */
/*---------------------------------------------------------------------------*/

/**
 * Returns the last portion of a path, similar to the Unix basename command.
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
 * Returns the version of BdBrowser's VFS according to the LocalStorage.
 * @see setBdBrowserVfsVersion
 * @returns {number|undefined} VFS version according to LocalStorage key.
 */
function getBdBrowserVfsVersion() {
    return getItem(BD_VFS_VERSION_KEY) || 0;
}

/**
 * Returns the accumulated size of all files in the VFS.
 * @returns {number} - Size of all files in bytes.
 */
function getVfsSizeInBytes() {
    let totalSize = 0;
    let fsizes = [];

    for (const [key, value] of Object.entries(cache.data)) {
        if(cache.data[key].nodeType === "file")
        {
            totalSize += cache.data[key].size;
            fsizes.push({fullName: key, size: cache.data[key].size });
        }
    }

    fsizes.sort((l, r) => (l.size < r.size ? 1 : -1));

    console.log(fsizes);
    return totalSize;
}

/**
 * Checks whether the LocalStorage contains the key carrying the virtual filesystem.
 * @returns {boolean}
 */
function hasBdBrowserFiles() {
    let bdFilesItem = getItem(BD_FILES_KEY);
    return (bdFilesItem !== undefined);
}

/**
 * Checks whether the LocalStorage key for the migration is present and set to `true`.
 * @returns {boolean}
 */
function hasBeenMigrated() {
    let wasMigrated = getItem(BD_FILES_MIGRATED_KEY);
    return (wasMigrated === true);
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

        let localStorageData = getItem(BD_FILES_KEY);
        if(!localStorageData)
        {
            setBdBrowserVfsVersion(BD_VFS_VERSION);
            resolvePromise(false);
            return;
        }

        Logger.log("VFS", "Migrating existing data from Local Storage into IndexedDB...");
        let startTime = performance.now();

        let localStorageJson = Object.assign({}, JSON.parse(localStorageData));

        // Skip the root node; directly start in "files" so there are keys to evaluate!
        importLocalStorageNode(localStorageJson.files);

        setBdBrowserVfsVersion(BD_VFS_VERSION);
        setBdBrowserFilesMigrated();

        let endTime = performance.now();
        Logger.log("VFS", `Migration of existing data complete, took ${(endTime - startTime).toFixed(2)}ms.`);
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
        if(!vfsObject[vfsObjectKey].hasOwnProperty("type"))
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
        resolvePromise(true);
    });
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
    setItem(BD_FILES_MIGRATED_KEY, value);
}

/**
 * Sets the LocalStorage VFS version key.
 * @see BD_VFS_VERSION
 * @param {number} version - New version of the VFS.
 */
function setBdBrowserVfsVersion(version) {
    setItem(BD_VFS_VERSION_KEY, version);
}

/**
 * Internal maintenance function to service VFS objects and perform updates.
 * Called during {@link initializeVfs} if {@link BD_VFS_VERSION} is greater
 * than the return value of {@link getBdBrowserVfsVersion}.
 */
function upgradeVfsData() {
    const textDecoder = new TextDecoder();
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
    return undefined;
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

export function existsSync(path) {
    try {
        path = normalizePath(path);
        let stats = statSync(path);
        return stats.isFile() || stats.isDirectory();
    } catch (e) {
        return false;
    }
}

export function statSync(path) {
    path = normalizePath(path);

    let fsEntry = getVfsCacheEntry(path);

    if (fsEntry?.nodeType !== "file" && fsEntry?.nodeType !== "dir")
        throw Object.assign(new Error(`ENOENT, No such file or directory '${path}'`), {
            stack: undefined,
            arguments: undefined,
            errno: 2,
            type: undefined,
            code: "ENOENT",
            path: path
        });

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

export function mkdirSync(path) {
    path = normalizePath(path);

    // Inode must not exist yet
    if(existsSync(path))
        return false;

    // Parent directory needs to exist
    let parentPath = Path.dirname(path);
    if(parentPath && !existsSync(parentPath))
        return false;

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
}

export function readdirSync(path) {
    path = normalizePath(path);
    let found = [];

    // Check if element exists at all
    if(!existsSync(path))
        return NOT_FOUND;

    // Check if element is a directory
    let stat = statSync(path);

    if(!stat.isDirectory())
        return NOT_A_DIR;

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
    let useEncoding;

    if(options) {
        switch(typeof(options))
        {
            case "string":
                useEncoding = options;
                break;
            case "object":
                if(options.hasOwnProperty("encoding"))
                    useEncoding = options.encoding;
                break;
        }
    }

    let fsEntry = getVfsCacheEntry(path);

    if(!fsEntry)
        return NOT_FOUND;

    if(useEncoding) {
        let textDecoder = new TextDecoder(useEncoding);
        // Call toString() - it is a DOMString!
        return textDecoder.decode(fsEntry.contents).toString();
    } else {
        // Always return a VfsBuffer, so .toString() works as expected.
        return new VfsBuffer(fsEntry.contents);
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
 * @returns {string} Strencher's error code, not conforming to node.js.
 */
export function unlinkSync(path) {
    path = normalizePath(path);

    if(!existsSync(path))
        return NOT_FOUND;

    let stat = statSync(path);

    if(stat.isFile())
    {
        removeFromVfsCache(path);
        removeIndexedDbKey(path);
        inotify(path, "rename");
    }
    else
    {
        for(let vfsObject in cache.data) {
            let vfsEntry = getVfsCacheEntry(vfsObject);

            if (vfsEntry.pathName.startsWith(path))
            {
                unlinkSync(vfsEntry.fullName);
            }
        }
        removeFromVfsCache(path);
        removeIndexedDbKey(path);
        inotify(path, "rename");
    }
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

export function writeFile(path, content, callback) {
    try {
        writeFileSync(path, content);
        callback();
    } catch(e) {
        callback(e);
    }
}

export function writeFileSync(path, content) {
    path = normalizePath(path);
    let filename = Path.basename(path);
    let encodedContent = new VfsBuffer([]);

    if (!isFile(filename))
        return false;

    if (!existsSync(Path.dirname(path)))
        return false;

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
    inotify(path, "change");
}

/*---------------------------------------------------------------------------*/
/* IndexedDB Functions                                                       */
/*---------------------------------------------------------------------------*/

/**
 * Returns an object store for the BdBrowser VFS store with the requested
 * transaction mode.
 * @param {string} [mode="readonly"] - Transaction mode
 * @returns {IDBObjectStore} - Object store
 */
function getObjectStore(mode = "readonly") {
    let txOptions = { durability: DB_DURABILITY }
    let transaction = database.transaction(DB_STORE, mode, txOptions);
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

        request.onsuccess = function () {
            Logger.log("VFS", "Database connection established.");
            database = this.result;
            resolvePromise(true);
        }

        request.onerror = function (e) {
            Logger.error("VFS", "Could not establish database connection:", request.error);
            rejectPromise(e);
        }

        request.onversionchange = function () {
            Logger.log("VFS", "Database version changed.");
        }

        request.onupgradeneeded = function (event) {
            event.currentTarget.result.createObjectStore(DB_STORE, {keyPath: "fullName"})
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
        let startTime = performance.now();

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

            let endTime = performance.now();
            Logger.log("VFS", `Memory cache populated, took ${(endTime - startTime).toFixed(2)}ms. VFS is ready.`);
            resolvePromise(true);
        }

        vfsEntries.onerror = function (e) {
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

    let store = getObjectStore("readwrite");
    let res = store.delete(fullNameKey);

    res.onsuccess = function() {
        if(DB_FORCE_COMMIT)
            store.transaction.commit();
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

    let store = getObjectStore("readwrite");
    let res = store.put(vfsEntryObject);

    res.onsuccess = function() {
        if(DB_FORCE_COMMIT)
            store.transaction.commit();
    }
}

const fs = {
    /* vfs-specific */
    dumpVfsCache,
    getVfsCacheEntry,
    getVfsSizeInBytes,
    initializeVfs,
    openDatabase,
    upgradeVfsData,
    /* tooling */
    basename,
    normalizePath,
    /* fs */
    exists: existsSync,
    existsSync,
    mkdirSync,
    readFile,
    readFileSync,
    readdirSync,
    realpathSync: normalizePath,
    statSync,
    unlink,
    unlinkSync,
    watch,
    writeFile,
    writeFileSync
}

export default fs;