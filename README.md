<h1 align="center">
  ✨ Summarizer
</h1>

<p>
    Summarizer is a BetterDiscord plugin that generates summaries of articles linked in Discord messages. It uses AI-powered summarization to provide concise and informative summaries, making it easier for users to quickly grasp the main points of shared articles without having to read through the entire content.
</p>

<p align="center">
    <a href="https://ko-fi.com/Z8Z2NV2H6">
        <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Ko-fi Donation Page">
    </a>
</p>

## Features

-   [x] Generates summaries using advanced AI models
-   [x] Allows users to click on the original article link to read the full content
-   [x] Provides customizable settings for AI model selection
-   [ ] Support for multiple AI providers (currently only Google Gemini is supported)
-   [ ] Soft paywall bypass

## Installation

1. Ensure you have BetterDiscord installed. If not, download and install it from [BetterDiscord's official website](https://betterdiscord.app/).
2. Download the `Summarizer.plugin.js` file from the [official repository](https://github.com/JanitorialMess/Summarizer/releases/latest/download/Summarizer.plugin.js) or [BetterDiscord plugin repository](https://betterdiscord.app/plugins) (coming soon).
3. Navigate to your BetterDiscord plugins folder. You can find this folder by going to User Settings > Plugins > Open Plugin Folder within Discord.
4. Drag and drop the `Summarizer.plugin.js` file into the plugins folder.
5. Enable the Summarizer plugin from the BetterDiscord plugins tab.

## Configuration

To use the Summarizer plugin, you need to provide an API key for the AI provider. Follow these steps to configure the plugin:

1. Go to User Settings > Plugins.
2. In the settings panel, enter your API key for the selected AI provider (e.g., Google Gemini).
3. Choose the desired AI model from the dropdown list (default is "gemini-1.5-flash").
4. Edit the system prompt or summary template to your liking

## Usage

Once the Summarizer plugin is installed and configured, it will automatically detect article links in Discord messages. When a message contains a link, you will see a "✨ Summarize" button in the message context menu (right-click on the message).

Click on the "✨ Summarize" button to generate a summary of the linked article. The summary will be appended to the original message, formatted as follows:

```
## 📰 Article Summary
> **🌟 Key Highlights**
> 1. {{keyPoints1}}.
> 2. {{keyPoints2}}.
> 3. {{keyPoints3}}.
> 4. {{keyPoints4}}.
> N. {{keyPointsN}}.
> **📌 Main Topic(s)**
> - {{mainTopics1}}
> - {{mainTopics2}}
> - {{mainTopicsN}}
> **💡 Takeaway**
> {{takeaway}}
>
> *Disclaimer: This summary is generated based on AI algorithms and may not capture all nuances of the original article. For the most accurate and complete information, please refer to the **[full article]({{link}})**.*
```

## Contributing

Contributions are welcome! If you'd like to contribute, feel free to fork the repository and submit a pull request.

## Support

If you encounter any issues or have suggestions for improvements, please open an [issue](https://github.com/JanitorialMess/Summarizer/issues/new).

## Acknowledgements

The build tools for this project are based on JustOptimize's [return-ShowHiddenChannels](https://github.com/JustOptimize/return-ShowHiddenChannels) plugin.

## License

This project is licensed under GPLv3 - see the [LICENSE](https://github.com/JanitorialMess/Summarizer/blob/main/LICENSE) file for details.

## Copyright Disclaimer

Summarizer is not affiliated with Discord or any of the platforms it supports. All product names, logos, and brands are property of their respective owners.
