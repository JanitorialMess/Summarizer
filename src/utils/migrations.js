/* eslint-disable no-unused-vars */
module.exports = {
    '0.3.1': (settings, defaultSettings) => {
        const preservedSettings = ['apiKey', 'localMode', 'contentProxyUrl', 'userAgent'];
        return {
            ...defaultSettings,
            ...Object.fromEntries(preservedSettings.map((key) => [key, settings[key]])),
        };
    },
    '0.3.2': (settings, defaultSettings) => {
        if (settings.providerId === 'google') {
            settings.providerId = 'gemini';
        }
        return settings;
    },
    '0.3.4': (settings, defaultSettings) => {
        return {
            ...settings,
            userAgent: defaultSettings.userAgent,
        };
    },
};
