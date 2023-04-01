const saveOptions = () => {
    const disableRenderer = document.getElementById('disableBdRenderer').checked;
    const deleteRendererOnReload = document.getElementById('deleteBdRendererOnReload').checked;

    chrome.storage.sync.set(
        {
            disableBdRenderer: disableRenderer,
            deleteBdRendererOnReload: deleteRendererOnReload
        },
        () => {

        }
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        {
            disableBdRenderer: false,
            deleteBdRendererOnReload: false
        },
        (options) => {
            document.getElementById('disableBdRenderer').checked = options.disableBdRenderer;
            document.getElementById('deleteBdRendererOnReload').checked = options.deleteBdRendererOnReload;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('disableBdRenderer').addEventListener('change', saveOptions);
document.getElementById('deleteBdRendererOnReload').addEventListener('change', saveOptions);
