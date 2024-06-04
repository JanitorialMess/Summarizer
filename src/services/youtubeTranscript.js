const HttpClient = require('../utils/httpClient');

const DEFAULT_YOUTUBE_TRANSCRIPT_URL = 'https://api.kome.ai/api/tools/youtube-transcripts';
const YOUTUBE_REGEX =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
class YouTubeTranscriptService {
    constructor(settings) {
        this.settings = settings;
        this.httpClient = new HttpClient({
            headers: {
                Origin: 'https://kome.ai',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    extractVideoId(url) {
        const match = url.match(YOUTUBE_REGEX);
        return match ? match[1] : null;
    }

    static isYouTubeLink(url) {
        return YOUTUBE_REGEX.test(url);
    }

    static templateToUrl(urlTemplate, url, videoId) {
        return urlTemplate.replace('{{url}}', url).replace('{{videoId}}', videoId);
    }

    async fetchTranscript(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        try {
            const data = await this.httpClient.post(DEFAULT_YOUTUBE_TRANSCRIPT_URL, { video_id: videoId, format: true });
            return data.transcript;
        } catch (error) {
            if (!this.settings.ytTranscriptFallbackUrl) {
                throw error;
            }

            const fallbackUrl = YouTubeTranscriptService.templateToUrl(this.settings.ytTranscriptFallbackUrl, url, videoId);
            const fallbackResponse = await this.httpClient.get(fallbackUrl);

            const text = await fallbackResponse.text();
            return text;
        }
    }
}

module.exports = YouTubeTranscriptService;
