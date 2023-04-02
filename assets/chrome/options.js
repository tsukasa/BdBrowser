const saveOptions = () => {
    const disableRenderer = document.getElementById('disableBdRenderer').checked;
    const disablePluginsOnReload = document.getElementById('disableBdPluginsOnReload').checked;
    const deleteRendererOnReload = document.getElementById('deleteBdRendererOnReload').checked;

    chrome.storage.sync.set(
        {
            disableBdRenderer: disableRenderer,
            disableBdPluginsOnReload: disablePluginsOnReload,
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
            disableBdPluginsOnReload: false,
            deleteBdRendererOnReload: false
        },
        (options) => {
            document.getElementById('disableBdRenderer').checked = options.disableBdRenderer;
            document.getElementById('disableBdPluginsOnReload').checked = options.disableBdPluginsOnReload;
            document.getElementById('deleteBdRendererOnReload').checked = options.deleteBdRendererOnReload;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('disableBdRenderer').addEventListener('change', saveOptions);
document.getElementById('disableBdPluginsOnReload').addEventListener('change', saveOptions);
document.getElementById('deleteBdRendererOnReload').addEventListener('change', saveOptions);
