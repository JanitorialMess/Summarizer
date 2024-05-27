const FallbackLibrary = {
    Logger: {
        info: console.info,
        warn: console.warn,
        err: console.error,
    },
    Settings: {},
    DiscordModules: {},
};

const {
    WebpackModules,
    Utilities,
    DOMTools,
    Logger,
    ReactTools,
    Modals,

    Settings: { SettingField, SettingPanel, SettingGroup, Switch, Textbox, Dropdown },

    DiscordModules: { MessageStore, TextElement, React, ReactDOM, Dispatcher },
} = global.ZeresPluginLibrary ?? FallbackLibrary;

const ContextMenu = window.BdApi?.ContextMenu;
const Net = window.BdApi?.Net;
const Utils = window.BdApi?.Utils;
const BetterWebpackModules = window.BdApi.Webpack;
const TextArea = WebpackModules.getModule((m) => m.TextArea)?.TextArea;

const UsedModules = {
    /* Library */
    Utilities,
    DOMTools,
    Logger,
    ReactTools,
    Modals,

    /* Settings */
    SettingField,
    SettingPanel,
    SettingGroup,
    Dropdown,
    Switch,
    Textbox,

    /* Discord Modules (From lib) */
    React,
    ReactDOM,
    MessageStore,
    TextElement,

    /* BdApi */
    ContextMenu,
    Net,

    /* Manually found modules */
    TextArea,
};

function checkVariables() {
    if (!global.ZeresPluginLibrary) {
        Logger.err('ZeresPluginLibrary not found.');
        return false;
    }

    for (const variable in UsedModules) {
        if (!UsedModules[variable]) {
            Logger.err('Variable not found: ' + variable);
        }
    }

    if (Object.values(UsedModules).includes(undefined)) {
        return false;
    }

    Logger.info('All variables found.');
    return true;
}

export const loaded_successfully = checkVariables();
export const ModuleStore = UsedModules;
