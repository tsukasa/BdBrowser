const headerSizeIndex = 12,
    headerOffset = 16,
    uInt32Size = 4,
    textDecoder = new TextDecoder("utf-8");

// Essentially just ripped from the chromium-pickle-js source, thanks for
// doing my math homework.
const alignInt = (i, alignment) =>
    i + (alignment - (i % alignment)) % alignment;

/**
 *
 * @param {ArrayBuffer} archive Asar archive to open
 * @returns {ArchiveData}
 */
const openAsar = archive => {
  if (archive.length > Number.MAX_SAFE_INTEGER) {
    throw new Error("Asar archive too large.");
  }

  const headerSize = new DataView(archive).getUint32(headerSizeIndex, true),
      // Pickle wants to align the headers so that the payload length is
      // always a multiple of 4. This means you'll get "padding" bytes
      // after the header if you don't round up the stored value.
      //
      // IMO why not just store the aligned int and have us trim the json,
      // but it's whatever.
      headerEnd = headerOffset + headerSize,
      filesOffset = alignInt(headerEnd, uInt32Size),
      rawHeader = archive.slice(headerOffset, headerEnd),
      buffer = archive.slice(filesOffset);

  /**
   * @typedef {Object} ArchiveData
   * @property {Object} header - The asar file's manifest, containing the pointers to each index's files in the buffer
   * @property {ArrayBuffer} buffer - The contents of the archive, concatenated together.
   */
  return {
    header: JSON.parse(textDecoder.decode(rawHeader)),
    buffer
  };
};

const crawlHeader = function self(files, dirname) {
  const prefix = itemName =>
      (dirname ? dirname + "/" : "") + itemName;

  let children = [];

  for (const filename in files) {
    const extraFiles = files[filename].files;

    if (extraFiles) {
      const extra = self(extraFiles, filename);

      children = children.concat(extra);
    }

    children.push(filename);
  }

  return children.map(prefix);
};

/**
 * These paths must be absolute and posix-style, without a leading forward slash.
 * @typedef {String} ArchivePath
 */

/**
 * An Asar archive
 * @class
 * @param {ArrayBuffer} archive The archive to open
 */
class Asar {
  constructor(archive) {
    const {header, buffer} = openAsar(archive);

    this.header = header;
    this.buffer = buffer;
    this.contents = crawlHeader(header);
  }

  /**
   * Retrieves information on a directory or file from the archive's header
   * @param {ArchivePath} path The path to the dirent
   * @returns {Object}
   */
  find(path) {
    const navigate = (currentItem, navigateTo) => {
      if (currentItem.files) {
        const nextItem = currentItem.files[navigateTo];

        if (!nextItem) {
          if (path == "/") { // This breaks it lol
            return this.header;
          }

          throw new PathError(path, `${navigateTo} could not be found.`);
        }

        return nextItem;
      }

      throw new PathError(path, `${navigateTo} is not a directory.`);
    };

    return path
        .split("/")
        .reduce(navigate, this.header);
  }

  /**
   * Open a file in the archive
   * @param {ArchivePath} path The path to the file
   * @returns {ArrayBuffer} The file's contents
   */
  get(path) {
    const {offset, size} = this.find(path),
        offsetInt = parseInt(offset);

    return this.buffer.slice(offsetInt, offsetInt + size);
  }
}

class PathError extends Error {
  constructor(path, message) {
    super(`Invalid path "${path}": ${message}`);

    this.name = "PathError";
  }
}

export {Asar as default};
