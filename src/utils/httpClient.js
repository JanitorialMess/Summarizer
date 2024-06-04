const { Net } = require('../utils/modules').ModuleStore;

class HttpError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.response = response;
    }
}

class HttpClient {
    constructor(config = {}) {
        this.config = {
            baseUrl: '',
            timeout: 0,
            headers: {},
            parseResponse: async (response) => response.json(),
            ...config,
        };
    }

    async fetch(url, options = {}) {
        const { baseUrl, timeout, headers: defaultHeaders, parseResponse } = this.config;
        const { headers, body, ...requestOptions } = options;

        const requestUrl = `${baseUrl}${url}`;
        const requestHeaders = { ...defaultHeaders, ...headers };

        const response = await Net.fetch(requestUrl, {
            ...requestOptions,
            headers: requestHeaders,
            body: typeof body === 'object' ? JSON.stringify(body) : body,
            timeout,
        });

        if (!response.ok) {
            throw new HttpError(`HTTP error (status: ${response.status})`, response.status, response);
        }

        const data = await parseResponse(response);
        return data;
    }

    async get(url, options = {}) {
        return this.fetch(url, { method: 'GET', ...options });
    }

    async post(url, body, options = {}) {
        return this.fetch(url, { method: 'POST', body, ...options });
    }

    async put(url, body, options = {}) {
        return this.fetch(url, { method: 'PUT', body, ...options });
    }

    async patch(url, body, options = {}) {
        return this.fetch(url, { method: 'PATCH', body, ...options });
    }

    async delete(url, options = {}) {
        return this.fetch(url, { method: 'DELETE', ...options });
    }
}

module.exports = HttpClient;
