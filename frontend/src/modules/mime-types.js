import {extname} from "./path";
import db from "assets/mime-db.json";

// mime-types, mime-db
// Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
// Copyright (c) 2015-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
// MIT Licensed
//
// ============================================================================
//
// (The MIT License)
//
// Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
// Copyright (c) 2015-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// ============================================================================

/**
 * Module variables.
 * @private
 */

const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
const TEXT_TYPE_REGEXP = /^text\//i;

let extensionMapList = Object.create(null)
let typeMapList = Object.create(null)

// Populate the extensions/types maps
populateMaps(extensionMapList, typeMapList)

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} inputMimeType
 * @return {boolean|string}
 */
function getCharset (inputMimeType) {
    if (!inputMimeType || typeof inputMimeType !== 'string')
        return false;

    let match = EXTRACT_TYPE_REGEXP.exec(inputMimeType);
    let mime = match && db[match[1].toLowerCase()];

    if (mime && mime.charset)
        return mime.charset;

    // default text/* to utf-8
    if (match && TEXT_TYPE_REGEXP.test(match[1]))
        return 'UTF-8';

    return false;
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} inputData
 * @return {boolean|string}
 */
function getContentType (inputData) {
    if (!inputData || typeof inputData !== 'string')
        return false;

    let mime = inputData;

    if(inputData.indexOf('/') === -1)
        mime = lookupMimeType(inputData);

    if (!mime)
        return false;

    if (mime.indexOf('charset') === -1) {
        let detectedCharset = getCharset(mime);
        if (detectedCharset)
            mime += '; charset=' + detectedCharset.toLowerCase();
    }

    return mime;
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} inputContentType
 * @return {boolean|string}
 */
function getExtension (inputContentType) {
    if (!inputContentType || typeof inputContentType !== 'string')
        return false;

    let match = EXTRACT_TYPE_REGEXP.exec(inputContentType);
    let possibleExtensions = match && extensionMapList[match[1].toLowerCase()];

    if (!possibleExtensions || !possibleExtensions.length)
        return false;

    return possibleExtensions[0];
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */
function lookupMimeType (path) {
    if (!path || typeof path !== 'string')
        return false;

    let extension = extname('x.' + path)
        .toLowerCase()
        .substring(1);

    if (!extension)
        return false;

    return typeMapList[extension] || false;
}

/**
 * Populate the extensions and types maps.
 * @private
 */
function populateMaps (extensionMap, typeMap) {
    let preference = ['nginx', 'apache', undefined, 'iana'];

    Object.keys(db).forEach((type) => {
        let mime = db[type];
        let fileExtensions = mime.extensions;

        if (!fileExtensions || !fileExtensions.length)
            return;

        // mime -> extensions
        extensionMap[type] = fileExtensions;

        // extension -> mime
        for (let i = 0; i < fileExtensions.length; i++) {
            let extension = fileExtensions[i];

            if (typeMap[extension]) {
                let from = preference.indexOf(db[typeMap[extension]].source);
                let to = preference.indexOf(mime.source);

                if (typeMap[extension] !== 'application/octet-stream' &&
                    (from > to || (from === to && typeMap[extension].substring(0, 12) === 'application/')))
                    continue;
            }

            // set the extension -> mime
            typeMap[extension] = type;
        }
    });
}

export default {
    charset: getCharset,
    contentType: getContentType,
    extension: getExtension,
    lookup: lookupMimeType
}