const BaseProvider = require('./baseProvider');
const GeminiApi = require('../api/geminiApi');

const HarmBlockThreshold = {
    HARM_BLOCK_THRESHOLD_UNSPECIFIED: 'HARM_BLOCK_THRESHOLD_UNSPECIFIED',
    BLOCK_LOW_AND_ABOVE: 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_ONLY_HIGH: 'BLOCK_ONLY_HIGH',
    BLOCK_NONE: 'BLOCK_NONE',
};

const HarmCategory = {
    HARM_CATEGORY_UNSPECIFIED: 'HARM_CATEGORY_UNSPECIFIED',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
};

const DEFAULT_SAFETY_SETTINGS = [
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const DEFAULT_GENERATION_CONFIG = {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.8,
    topK: 10,
};

class GeminiProvider extends BaseProvider {
    static id = 'gemini';
    static label = 'Google Gemini';

    constructor(model, apiKey, config = {}) {
        super(model, apiKey, config);
        this.geminiApi = new GeminiApi(apiKey, config.apiVersion);
    }

    async invoke(messages) {
        const systemInstruction = messages.find((message) => message.role === 'system')?.content || '';
        const prompt = messages.find((message) => message.role === 'user')?.content || '';

        const options = {
            systemInstruction,
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxOutputTokens,
        };

        return this.generateContent(prompt, options);
    }

    async generateContent(prompt, options = {}) {
        const systemInstruction = options.systemInstruction || '';
        const safetySettings = options.safetySettings || DEFAULT_SAFETY_SETTINGS;
        const generationConfig = {
            ...DEFAULT_GENERATION_CONFIG,
            ...options.generationConfig,
        };

        const requestBody = {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
            systemInstruction: {
                parts: [{ text: systemInstruction }],
            },
            safetySettings,
            generationConfig,
        };

        const response = await this.geminiApi.generateContent(this.model, requestBody);
        return response.candidates[0].content.parts[0].text;
    }

    async getAvailableModels() {
        const response = await this.geminiApi.listModels();
        return response.models;
    }

    async getModel(modelId) {
        const response = await this.geminiApi.getModel(modelId);
        return response;
    }

    static getId() {
        return GeminiProvider.id;
    }

    static getLabel() {
        return GeminiProvider.label;
    }
}

module.exports = GeminiProvider;
