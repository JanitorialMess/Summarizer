const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatGroq } = require('@langchain/groq');

class BaseProvider {
    static id = 'base';
    constructor(model, apiKey) {
        this.model = model;
        this.apiKey = apiKey;
    }

    async invoke(prompts) {
        const provider = this.createProvider();
        return provider.invoke(prompts);
    }

    createProvider() {
        throw new Error('createProvider() must be implemented');
    }

    static getAvailableModels() {
        throw new Error('getAvailableModels() must be implemented');
    }
}

class GoogleProvider extends BaseProvider {
    static id = 'google';
    constructor(model, apiKey) {
        super(model, apiKey);
    }

    createProvider() {
        return new ChatGoogleGenerativeAI({
            model: this.model,
            apiKey: this.apiKey,
            maxOutputTokens: 2048,
        });
    }

    static getAvailableModels() {
        return [
            { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
            { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
            { label: 'Gemini 1.0 Pro', value: 'gemini-1.0-pro' },
        ];
    }
}
class OpenAIProvider extends BaseProvider {
    static id = 'openai';
    constructor(model, apiKey) {
        super(model, apiKey);
    }

    createProvider() {
        return new ChatOpenAI({
            model: this.model,
            apiKey: this.apiKey,
            maxTokens: 2048,
            streaming: false,
        });
    }

    static getAvailableModels() {
        return [
            { label: 'GPT-4o', value: 'gpt-4o' },
            { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
            { label: 'GPT-4', value: 'gpt-4' },
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        ];
    }
}
class GroqProvider extends BaseProvider {
    static id = 'groq';
    constructor(model, apiKey) {
        super(model, apiKey);
    }

    createProvider() {
        return new ChatGroq({
            model: this.model,
            apiKey: this.apiKey,
            maxTokens: 2048,
        });
    }

    static getAvailableModels() {
        return [
            { label: 'Llama 3 70B', value: 'llama3-70b-8192' },
            { label: 'Llama 3 8B', value: 'llama3-8b-8192' },
            { label: 'Gemma 7B IT', value: 'gemma-7b-it' },
            { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
        ];
    }
}

class ProviderFactory {
    static createProvider(providerId, model, apiKey) {
        switch (providerId) {
            case GoogleProvider.id:
                return new GoogleProvider(model, apiKey);
            case OpenAIProvider.id:
                return new OpenAIProvider(model, apiKey);
            case GroqProvider.id:
                return new GroqProvider(model, apiKey);
            default:
                throw new Error('Invalid provider ID');
        }
    }

    static getAvailableProviders() {
        return [
            { id: GoogleProvider.id, label: 'Google Gemini', classRef: GoogleProvider },
            { id: OpenAIProvider.id, label: 'OpenAI', classRef: OpenAIProvider },
            { id: GroqProvider.id, label: 'Groq', classRef: GroqProvider },
        ];
    }
}

module.exports = ProviderFactory;
