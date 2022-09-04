/**
 * A {@link TypedArray} for holding data retrieved from the VFS.
 * Internally all data is being handled as a {@link Uint8Array}, however when
 * returning data via {@link fs.readFileSync}, it needs to be handled slightly
 * different. The {@link VfsBuffer.toString} method returns a string while
 * Uint8Array's toString method returns a joined list of array values.
 */
export default class VfsBuffer extends Uint8Array {
    static name = "VfsBuffer";

    toString() {
        let textDecoder = new TextDecoder();
        return textDecoder.decode(this).toString();
    }
}
