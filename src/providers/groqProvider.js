const BaseProvider = require('./baseProvider');
const GroqAPI = require('../api/groqApi');

const DEFAULT_GENERATION_CONFIG = {
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
};

class GroqProvider extends BaseProvider {
    static id = 'groq';
    static label = 'Groq';

    constructor(model, apiKey, config = {}) {
        super(model, apiKey, config);
        this.groqAPI = new GroqAPI(apiKey);
    }

    async invoke(messages) {
        const options = {
            messages,
            temperature: this.config.temperature,
            max_tokens: this.config.max_tokens,
        };

        return this.generateContent(options);
    }

    async generateContent(options = {}) {
        const generationConfig = {
            ...DEFAULT_GENERATION_CONFIG,
            ...options,
        };

        const requestBody = {
            model: this.model,
            ...generationConfig,
        };

        const response = await this.groqAPI.createChatCompletion(requestBody);
        return response.choices[0].message.content;
    }

    async getAvailableModels() {
        const response = await this.groqAPI.listModels();
        return response.map((model) => ({
            label: model.id,
            value: model.id,
        }));
    }

    async getModel(model) {
        const response = await this.groqAPI.retrieveModel(model);
        return response;
    }

    static getId() {
        return GroqProvider.id;
    }

    static getLabel() {
        return GroqProvider.label;
    }
}

module.exports = GroqProvider;
