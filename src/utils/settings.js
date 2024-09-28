const { SettingPanel, SettingGroup } = require('./modules').ModuleStore;
const { TextAreaField, Textbox, Dropdown } = require('../components');
class Settings {
    constructor(plugin) {
        this.plugin = plugin;
    }

    createSetting(type, name, note, defaultValue, onChange, options = {}) {
        const setting = new type(
            name,
            note,
            defaultValue,
            (value) => {
                onChange(value);
                this.plugin.saveSettings();
            },
            options
        );
        return setting;
    }

    createGroup(name, settings) {
        const group = new SettingGroup(name);
        settings.forEach((setting) => group.append(setting));
        return group;
    }

    getProviderOptions() {
        return this.plugin.settings.providers.map((provider) => ({
            label: provider.label,
            value: provider.id,
        }));
    }

    getModelOptions(providerId) {
        const provider = this.plugin.settings.providers.find((p) => p.id === providerId);
        if (!provider) return [];

        return provider.models.map((model) => ({
            label: model.label,
            value: model.value,
        }));
    }

    getCurrentProviderApiKey(providerId) {
        const currentProvider = this.plugin.settings.providers.find((p) => p.id === providerId);
        return currentProvider ? currentProvider.apiKey : '';
    }

    createProviderSettings() {
        const modelDropdown = new Dropdown(
            'Model',
            'Select the LLM model.',
            this.plugin.settings.model,
            this.getModelOptions(this.plugin.settings.providerId),
            (value) => {
                this.plugin.settings.model = value;
                this.plugin.saveSettings();
            }
        );

        const providerDropdown = new Dropdown(
            'Provider',
            'Select the provider for content summarization.',
            this.plugin.settings.providerId,
            this.getProviderOptions(),
            (value) => {
                this.plugin.settings.providerId = value;
                this.plugin.saveSettings();

                // Update API key textbox
                const newApiKey = this.getCurrentProviderApiKey(value);
                apiKeyTextbox.updateValue(newApiKey);

                // Update model dropdown options
                const newModelOptions = this.getModelOptions(value);
                modelDropdown.updateOptions(newModelOptions);

                // Set the model to the first available option for the new provider
                if (newModelOptions.length > 0) {
                    this.plugin.settings.model = newModelOptions[0].value;
                    modelDropdown.setValue(this.plugin.settings.model);
                    this.plugin.saveSettings();
                }
            }
        );

        const apiKeyTextbox = new Textbox(
            'API Key',
            'Enter your API key for the selected provider.',
            this.getCurrentProviderApiKey(this.plugin.settings.providerId),
            (value) => {
                const currentProvider = this.plugin.settings.providers.find((p) => p.id === this.plugin.settings.providerId);
                if (currentProvider) {
                    currentProvider.apiKey = value?.trim() || '';
                    this.plugin.settings.apiKey = value?.trim() || '';
                }
                this.plugin.saveSettings();
            }
        );

        return [providerDropdown, apiKeyTextbox, modelDropdown];
    }

    getContentFetchingSettings() {
        return [
            this.createSetting(
                Textbox,
                'Content Proxy URL',
                'Specify the URL of the proxy server for retrieving content. Use {{url}} as a placeholder for the actual URL.',
                this.plugin.settings.contentProxyUrl,
                (value) => (this.plugin.settings.contentProxyUrl = value),
                { placeholder: 'https://example.com/proxy?url={{url}}' }
            ),
            this.createSetting(
                Textbox,
                'YouTube Transcript Fallback URL',
                'Specify the URL of the fallback server for retrieving YouTube transcripts. Use {{url}} as a placeholder for the actual video URL or {{videoId}} for the video ID.',
                this.plugin.settings.ytTranscriptFallbackUrl,
                (value) => (this.plugin.settings.ytTranscriptFallbackUrl = value),
                { placeholder: 'https://example.com/transcript?videoId={{videoId}}' }
            ),
            this.createSetting(
                Textbox,
                'User Agent',
                'Specify the user agent to use for fetching content (user only for content proxies).',
                this.plugin.settings.userAgent,
                (value) => (this.plugin.settings.userAgent = value),
                { placeholder: 'Enter the user agent here...' }
            ),
        ];
    }

    getAIOptions() {
        return [
            this.createSetting(
                TextAreaField,
                'System Prompt',
                'Enter the system prompt for the AI assistant. Leave empty to use the default prompt.',
                this.plugin.settings.systemPrompt,
                (value) => (this.plugin.settings.systemPrompt = value),
                { placeholder: 'Enter the system prompt here...' }
            ),
            this.createSetting(
                TextAreaField,
                'Summary Template',
                'Enter the template for the content summary in markdown format.',
                this.plugin.settings.summaryTemplate,
                (value) => (this.plugin.settings.summaryTemplate = value),
                { placeholder: 'Enter the summary template here...' }
            ),
            this.createSetting(
                TextAreaField,
                'Output Template',
                'Enter the template for the final output. Use {{response}} as a placeholder for the AI-generated summary, {{url}} for the URL, and {{aiName}} for the AI model name.',
                this.plugin.settings.outputTemplate,
                (value) => (this.plugin.settings.outputTemplate = value),
                { placeholder: 'Enter the output template here...' }
            ),
        ];
    }

    getPanel() {
        return SettingPanel.build(
            this.plugin.saveSettings.bind(this.plugin),
            ...this.createProviderSettings(),
            this.createGroup('Content Fetching Options', this.getContentFetchingSettings()),
            this.createGroup('AI Options', this.getAIOptions())
        );
    }
}

module.exports = function createSettings(plugin) {
    return new Settings(plugin);
};
