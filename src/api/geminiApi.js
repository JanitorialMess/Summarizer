const HttpClient = require('../utils/httpClient');

class GeminiApi {
    constructor(apiKey, apiVersion = 'v1beta') {
        this.apiKey = apiKey;
        this.apiVersion = apiVersion;
        this.baseUrl = `https://generativelanguage.googleapis.com/${this.apiVersion}`;

        this.httpClient = new HttpClient({
            baseUrl: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    withApiKey(url) {
        return `${url}?key=${this.apiKey}`;
    }

    async generateContent(model, requestBody) {
        const url = this.withApiKey(`/models/${model}:generateContent`);
        const response = await this.httpClient.post(url, requestBody);
        return response;
    }

    async getModel(model) {
        const url = this.withApiKey(`/models/${model}`);
        const response = await this.httpClient.get(url);
        return response;
    }

    async listModels() {
        const url = this.withApiKey('/models');
        const response = await this.httpClient.get(url);
        return response.models;
    }
}

module.exports = GeminiApi;
