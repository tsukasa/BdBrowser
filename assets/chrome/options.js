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

/**
 * Loads the i18n messages for the options page.
 * The i18n messages are loaded from the _locales folder.
 */
const loadI18n = () => {
    let elements = document.querySelectorAll("[i18n]");

    elements.forEach(element => {
        const i18nElement = element.getAttribute("i18n");
        const i18nMessage = chrome.i18n.getMessage(i18nElement);

        if (i18nMessage) {
            element.innerText = i18nMessage;
        }
    });
}

/**
 * Operations to perform once options page has loaded.
 */
const onContentLoaded = () => {
    loadI18n();
    restoreOptions();
}

const initialize = () => {
    document.addEventListener("DOMContentLoaded", onContentLoaded);

    document.getElementById("disableBdRenderer").addEventListener("change", saveOptions);
    document.getElementById("disableBdPluginsOnReload").addEventListener("change", saveOptions);
    document.getElementById("deleteBdRendererOnReload").addEventListener("change", saveOptions);
}

initialize();
