const { Readability } = require('@mozilla/readability');
const HttpClient = require('../utils/httpClient');
const YouTubeTranscriptService = require('./youtubeTranscript');

class SummarizerService {
    constructor(ProviderFactory, settings) {
        this.settings = settings;
        this.provider = this.createProvider(ProviderFactory);
        this.youtubeTranscriptService = new YouTubeTranscriptService(settings);
        this.httpClient = new HttpClient({
            'User-Agent': this.settings.userAgent || 'Robot/1.0.0 (+http://search.mobilesl.com/robot)',
        });
    }

    createProvider(ProviderFactory) {
        const { providerId, model, apiKey } = this.settings;
        return ProviderFactory.createProvider(providerId, model, apiKey);
    }

    generateQuery(text) {
        const { summaryTemplate } = this.settings;
        return `
          Please summarize the following article using the provided template:
          
          Template:
          ${summaryTemplate}
      
          Article Content:
          ${text}
          
          Summary:
      `;
    }

    async summarize(url) {
        try {
            const contentText = await this.retrieveContent(url);
            if (!contentText) return Promise.reject(new Error('Failed to fetch article text.'));

            const summary = await this.generateSummary(url, contentText);
            return summary;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async generateSummary(url, text) {
        const response = await this.provider.invoke([
            ['system', this.settings.systemPrompt],
            ['human', this.generateQuery(text)],
        ]);

        const outputTemplate = this.settings.outputTemplate
            .replaceAll('{{response}}', response.content.trim())
            .replaceAll('{{url}}', url)
            .replaceAll('{{aiName}}', this.settings.model)
            // Backward compatibility
            .replaceAll('{{link}}', url);

        return outputTemplate;
    }

    async retrieveContent(url) {
        if (YouTubeTranscriptService.isYouTubeLink(url)) {
            try {
                const transcript = await this.youtubeTranscriptService.fetchTranscript(url);
                return transcript;
            } catch (error) {
                throw new Error(`Failed to fetch YouTube transcript | ${error.message}`);
            }
        }

        try {
            const urlToFetch = this.settings.contentProxyUrl ? this.settings.contentProxyUrl.replace('{{url}}', url) : url;

            const response = await this.httpClient.get(urlToFetch);

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const reader = new Readability(doc);
            const readablePage = reader.parse();

            if (readablePage) {
                return readablePage.textContent.trim();
            } else {
                throw new Error('Failed to extract article content');
            }
        } catch (error) {
            throw new Error(`Failed to fetching article text: ${error.message}`);
        }
    }
}

module.exports = SummarizerService;
