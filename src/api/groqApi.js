const HttpClient = require('../utils/httpClient');

class GroqAPI {
    constructor(apiKey, apiVersion = 'v1') {
        this.apiKey = apiKey;
        this.apiVersion = apiVersion;
        this.baseURL = `https://api.groq.com/openai/${this.apiVersion}`;

        this.httpClient = new HttpClient({
            baseUrl: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
        });
    }

    async listModels() {
        const response = await this.httpClient.get('/models');
        return response.data;
    }

    async retrieveModel(model) {
        const response = await this.httpClient.get(`/models/${model}`);
        return response;
    }

    async createChatCompletion(params) {
        const response = await this.httpClient.post('/chat/completions', params);
        return response;
    }
}

module.exports = GroqAPI;
