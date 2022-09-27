/**
 * Discord and BetterDiscord are purposefully hiding access to the localStorage.
 * This function serves as a workaround until StorageManager works again...
 * Taken from https://stackoverflow.com/a/53773662
 * @returns {PropertyDescriptor}
 */
function getLocalStoragePropertyDescriptor() {
    const frame = document.createElement('frame');
    document.body.appendChild(frame);
    const p = Object.getOwnPropertyDescriptor(frame.contentWindow, 'localStorage');
    frame.remove();
    return p;
}

Object.defineProperty(window, 'restoredLocalStorage', getLocalStoragePropertyDescriptor());

export function getItem(key) {
    return window.restoredLocalStorage.getItem(key);
}

export function setItem(key, item) {
    window.restoredLocalStorage.setItem(key, item);
}

