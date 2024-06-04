const GeminiProvider = require('./geminiProvider');
const GroqProvider = require('./groqProvider');

class ProviderFactory {
    static createProvider(providerId, model, apiKey, config = {}) {
        const providerClass = this.getProviderClass(providerId);
        return new providerClass(model, apiKey, config);
    }

    static getProviderClass(providerId) {
        const provider = this.getAvailableProviders().find((p) => p.id === providerId);
        if (!provider) {
            throw new Error('Invalid provider ID');
        }
        return provider.classRef;
    }

    static getAvailableProviders() {
        return [
            { id: GeminiProvider.getId(), label: GeminiProvider.getLabel(), classRef: GeminiProvider },
            { id: GroqProvider.getId(), label: GroqProvider.getLabel(), classRef: GroqProvider },
        ];
    }
}

module.exports = ProviderFactory;
