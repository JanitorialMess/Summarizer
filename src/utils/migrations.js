module.exports = {
    '0.3.1': (settings, defaultSettings) => {
        const preservedSettings = ['apiKey', 'localMode', 'contentProxyUrl', 'userAgent'];
        return {
            ...defaultSettings,
            ...Object.fromEntries(preservedSettings.map((key) => [key, settings[key]])),
        };
    },
};
