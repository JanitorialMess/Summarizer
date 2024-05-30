const { Readability } = require('@mozilla/readability');
const { Net } = require('../utils/modules').ModuleStore;

class ArticleSummarizer {
    constructor(ProviderFactory, settings) {
        this.settings = settings;
        this.provider = this.createProvider(ProviderFactory);
    }

    createProvider(ProviderFactory) {
        const { providerId, model, apiKey } = this.settings;
        return ProviderFactory.createProvider(providerId, model, apiKey);
    }

    async summarize(link) {
        try {
            const contentText = await this.retrieveContent(link);
            if (!contentText) return Promise.reject(new Error('Failed to fetch article text.'));

            const summary = await this.generateSummary(link, contentText);
            return summary;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async generateSummary(link, text) {
        const template = this.prepareSummaryTemplate(link);
        const response = await this.provider.invoke([
            ['system', this.settings.systemPrompt],
            ['human', template.replace('{{text}}', text)],
        ]);
        return response.content;
    }

    prepareSummaryTemplate(link) {
        const { model } = this.settings;
        return `
          Please summarize the following article using the provided template:
      
          Article URL: ${link}
      
          Template:
          ${this.settings.summaryTemplate.replaceAll('{{link}}', link).replaceAll('{{aiName}}', model)}
      
          Article Content:
          {{text}}
          
          Summary:
      `;
    }

    async retrieveContent(link) {
        try {
            const urlToFetch = this.settings.contentProxyUrl ? this.settings.contentProxyUrl.replace('{{link}}', link) : link;

            const response = await Net.fetch(urlToFetch, {
                method: 'GET',
                headers: {
                    'User-Agent': this.settings.userAgent || 'Robot/1.0.0 (+http://search.mobilesl.com/robot)',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch article content: ${response.status}`);
            }

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const reader = new Readability(doc);
            const readablePage = reader.parse();

            if (readablePage) {
                return readablePage.textContent.trim();
            } else {
                throw new Error('Failed to extract article content.');
            }
        } catch (error) {
            throw new Error(`Error fetching article text: ${error.message}`);
        }
    }
}

module.exports = ArticleSummarizer;
