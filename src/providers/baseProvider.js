class BaseProvider {
    constructor(model, apiKey, config = {}) {
        this.model = model;
        this.apiKey = apiKey;
        this.config = config;
    }

    // eslint-disable-next-line no-unused-vars
    async invoke(messages) {
        throw new Error('invoke() must be implemented by the provider');
    }

    async getAvailableModels() {
        throw new Error('getAvailableModels() must be implemented by the provider');
    }

    // eslint-disable-next-line no-unused-vars
    async getModel(modelId) {
        throw new Error('getModel() must be implemented by the provider');
    }

    static getId() {
        throw new Error('getId() must be implemented by the provider');
    }

    static getLabel() {
        throw new Error('getLabel() must be implemented by the provider');
    }
}

module.exports = BaseProvider;
