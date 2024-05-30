const { Net } = require('../utils/modules').ModuleStore;

class HttpClient {
    constructor(defaultHeaders = {}) {
        this.defaultHeaders = defaultHeaders;
    }

    async fetch(url, options = {}) {
        const headers = { ...this.defaultHeaders, ...options.headers };
        const response = await Net.fetch(url, { ...options, headers });

        if (!response.ok) {
            throw new Error(`HTTP error (status: ${response.status})`);
        }

        return response;
    }

    async get(url, headers = {}) {
        return this.fetch(url, { method: 'GET', headers });
    }

    async post(url, body, headers = {}) {
        return this.fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body),
        });
    }
}

module.exports = HttpClient;
