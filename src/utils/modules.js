/* eslint-disable no-unused-vars */
const pluginName = 'Summarizer';

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
    Logger: _Logger,
    ReactTools,
    Modals,

    Settings: { SettingField, SettingPanel, SettingGroup, Switch, Textbox, Dropdown },

    DiscordModules: { MessageStore, TextElement, React, ReactDOM, Dispatcher, UserStore, MessageActions },
} = global.ZeresPluginLibrary ?? FallbackLibrary;

const ContextMenu = window.BdApi?.ContextMenu;
const Net = window.BdApi?.Net;
const Utils = window.BdApi?.Utils;
const BetterWebpackModules = window.BdApi.Webpack;
const TextArea = WebpackModules.getModule((m) => m.TextArea)?.TextArea;
const EmbedUtils = WebpackModules.getByProps('sanitizeEmbed');

const Logger = {
    info: (...args) => _Logger.info(pluginName, ...args),
    warn: (...args) => _Logger.warn(pluginName, ...args),
    err: (...args) => _Logger.err(pluginName, ...args),
    log: (...args) => _Logger.info(pluginName, ...args),
    debug: (...args) => _Logger.info(pluginName, ...args),
    stacktrace: (...args) => _Logger.err(pluginName, ...args),
};

const UsedModules = {
    /* Library */
    Utilities,
    DOMTools,
    Logger,
    ReactTools,
    Modals,
    Dispatcher,

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
    UserStore,
    MessageActions,
    TextElement,

    /* BdApi */
    ContextMenu,
    Net,

    /* Manually found modules */
    TextArea,
    EmbedUtils,
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

    return true;
}

export const loaded_successfully = checkVariables();
export const ModuleStore = UsedModules;
