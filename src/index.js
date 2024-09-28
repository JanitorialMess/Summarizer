const config = {
    info: {
        name: 'Summarizer',
        authors: [
            {
                name: 'JanitorialMess',
                discord_id: '671095271412727854',
            },
        ],
        version: '0.3.5',
        description: 'Summarizes the content of articles linked in messages.',
    },
    changelog: [],
    main: 'Summarizer.plugin.js',
};

class MissingZeresDummy {
    constructor() {
        console.warn(
            'ZeresPluginLibrary is required for this plugin to work. Please install it from https://betterdiscord.app/Download?id=9'
        );
        this.downloadZLibPopup();
    }

    start() {}
    stop() {}

    getDescription() {
        return `The library plugin needed for ${config.info.name} is missing. Please enable this plugin, click the settings icon on the right and click "Download Now" to install it.`;
    }

    getSettingsPanel() {
        const buttonClicker = document.createElement('oggetto');
        buttonClicker.addEventListener('DOMNodeInserted', () => {
            buttonClicker.parentElement.parentElement.parentElement.style.display = 'none';

            const buttonToClick = document.querySelector('.bd-button > div');
            buttonToClick.click();

            this.downloadZLibPopup();
        });

        return buttonClicker;
    }

    async downloadZLib() {
        window.BdApi.UI.showToast('Downloading ZeresPluginLibrary...', {
            type: 'info',
        });

        eval('require')('request').get('https://betterdiscord.app/gh-redirect?id=9', async (err, resp, body) => {
            if (err || !body) return this.downloadZLibErrorPopup();

            if (!body.match(/(?<=version: ").*(?=")/)) {
                console.error('Failed to download ZeresPluginLibrary, this is not the correct content.');
                return this.downloadZLibErrorPopup();
            }

            await this.manageFile(body);
        });
    }

    manageFile(content) {
        this.downloadSuccefulToast();

        new Promise((cb) => {
            eval('require')('fs').writeFile(
                eval('require')('path').join(window.BdApi.Plugins.folder, '0PluginLibrary.plugin.js'),
                content,
                cb
            );
        });
    }

    downloadSuccefulToast() {
        window.BdApi.UI.showToast('Successfully downloaded ZeresPluginLibrary!', {
            type: 'success',
        });
    }

    downloadZLibPopup() {
        window.BdApi.UI.showConfirmationModal(
            'Library Missing',
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
            {
                confirmText: 'Download Now',
                cancelText: 'Cancel',
                onConfirm: () => this.downloadZLib(),
            }
        );
    }

    downloadZLibErrorPopup() {
        window.BdApi.UI.showConfirmationModal(
            'Error Downloading',
            `ZeresPluginLibrary download failed. Manually install plugin library from the link below.`,
            {
                confirmText: 'Visit Download Page',
                cancelText: 'Cancel',
                onConfirm: () => eval('require')('electron').shell.openExternal('https://betterdiscord.app/Download?id=9'),
            }
        );
    }
}

export default !global.ZeresPluginLibrary
    ? MissingZeresDummy
    : (([Pl, Lib]) => {
          // eslint-disable-next-line no-unused-vars
          const plugin = (Plugin, Library) => {
              const { loaded_successfully } = require('./utils/modules');
              const semver = require('semver');
              const {
                  /* Library */
                  Utilities,
                  Logger,
                  Dispatcher,

                  /* Discord Modules (From lib) */
                  React,
                  UserStore,
                  MessageStore,
                  MessageActions,

                  /* BdApi */
                  ContextMenu,

                  /* Manually found modules */
                  EmbedUtils,

                  /* Props */
                  sanitizeEmbedProp,
              } = require('./utils/modules').ModuleStore;
              const createSettings = require('./utils/settings');
              const Toasts = require('./utils/toasts').default;
              const ProviderFactory = require('./providers');
              const SummarizerService = require('./services/summarizer');
              const migrations = require('./utils/migrations');

              const ogSanitizeEmbed = EmbedUtils[sanitizeEmbedProp];

              const defaultSettings = {
                  version: config.info.version,
                  providerId: 'gemini',
                  model: 'gemini-1.5-flash',
                  providers: [
                      {
                          id: 'gemini',
                          label: 'Google Gemini',
                          apiKey: '',
                          models: [
                              { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                              { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
                              { label: 'Gemini 1.0 Pro', value: 'gemini-1.0-pro' },
                          ],
                      },
                      {
                          id: 'groq',
                          label: 'Groq',
                          apiKey: '',
                          models: [
                              { label: 'Llama 3 70B', value: 'llama3-70b-8192' },
                              { label: 'Llama 3 8B', value: 'llama3-8b-8192' },
                              { label: 'Gemma 7B IT', value: 'gemma-7b-it' },
                              { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
                          ],
                      },
                  ],
                  localMode: true,
                  contentProxyUrl: '',
                  ytTranscriptFallbackUrl: '',
                  userAgent: 'googlebot',
                  systemPrompt:
                      'You are an AI assistant that summarizes articles. Provide a concise and informative summary of the given text. Do not include any additional formatting, explanations, or opinions in your response.',
                  summaryTemplate: `## 📰 Article Summary
> **🌟 Key Highlights**
> - {keyPoints}
> **📌 Main Topic(s)**
> - {mainTopics}
> **💡 Takeaway**
> {takeaway}
`,
                  outputTemplate: `{{response}}
> 
> *Disclaimer: This summary is generated by AI ({{aiName}}) and may not capture all nuances of the original article. For the most accurate and complete information, please refer to the **[full article]({{url}})**.*
`,
              };

              return class Summarizer extends Plugin {
                  constructor() {
                      super();
                      this.settingPanel = createSettings(this);
                      this.settings = this.migrateSettings(Utilities.loadSettings(config.info.name, 'settings', defaultSettings));
                  }

                  migrateSettings(settings) {
                      const currentVersion = config.info.version;
                      const settingsVersion = settings.version || '0.0.0';

                      if (semver.lt(settingsVersion, currentVersion)) {
                          let migratedSettings = settings;
                          const migrationVersions = Object.keys(migrations)
                              .filter((version) => semver.gt(version, settingsVersion) && semver.lte(version, currentVersion))
                              .sort(semver.compare);

                          migrationVersions.forEach((version) => {
                              migratedSettings = migrations[version](migratedSettings, defaultSettings);
                          });

                          migratedSettings.version = currentVersion;
                          this.saveSettings(migratedSettings);

                          return migratedSettings;
                      }
                      const mergedSettings = { ...defaultSettings, ...settings };
                      mergedSettings.version = currentVersion;
                      return mergedSettings;
                  }

                  async onStart() {
                      if (!loaded_successfully) {
                          BdApi.Plugins.disable(config.info.name);
                          return;
                      }
                      try {
                          ContextMenu.patch('message', this.messageContextPatch);
                      } catch (error) {
                          Logger.err('Failed to fetch and cache providers:', error);
                      }
                  }

                  messageContextPatch = (ret, props) => {
                      const children = ret.props.children;
                      const message = MessageStore.getMessage(props.channel.id, props.message.id);

                      if (message && message.content && message.content.match(/https?:\/\/\S+/gi)) {
                          children.push(
                              ContextMenu.buildItem({
                                  type: 'separator',
                              }),
                              ContextMenu.buildItem({
                                  label: 'Summarize',
                                  action: () => {
                                      this.summarizeArticle(message);
                                  },
                                  color: 'premium',
                                  icon: () =>
                                      // eslint-disable-next-line react/no-children-prop
                                      React.createElement('svg', {
                                          className: 'icon_d90b3d',
                                          ariaHidden: true,
                                          role: 'img',
                                          xmlns: 'http://www.w3.org/2000/svg',
                                          width: 18,
                                          height: 18,
                                          viewBox: '0 0 56 56',
                                          fill: 'none',
                                          children: [
                                              React.createElement('path', {
                                                  fill: 'currentColor',
                                                  d: 'M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z',
                                              }),
                                          ],
                                      }),
                              })
                          );
                      }
                  };

                  validateSettings() {
                      const requiredSettings = ['providerId', 'model'];
                      const invalidSettings = requiredSettings.filter((setting) => !this.settings[setting]);

                      if (invalidSettings.length) {
                          BdApi.showToast(`Please enter a valid ${invalidSettings.join(', ')}`, {
                              type: 'error',
                          });
                          return false;
                      }

                      const selectedProvider = this.settings.providers.find((provider) => provider.id === this.settings.providerId);

                      if (!selectedProvider) {
                          BdApi.showToast('Invalid provider selected', {
                              type: 'error',
                          });
                          return false;
                      }

                      const selectedModel = selectedProvider.models.find((model) => model.value === this.settings.model);

                      if (!selectedModel) {
                          BdApi.showToast('Invalid model selected for the current provider', {
                              type: 'error',
                          });
                          return false;
                      }

                      return true;
                  }

                  async summarizeArticle(message) {
                      if (!this.validateSettings()) {
                          Logger.log('Invalid settings detected');
                          BdApi.showToast('Invalid plugin settings detected. Please check your configuration.', {
                              type: 'error',
                          });
                          return;
                      }

                      const url = message.content.match(/https?:\/\/\S+/gi)[0];
                      const key = `summarize-${message.id}`;

                      try {
                          Toasts.show(key, 'Summarizing...', { type: 'warning', expires: false, minDisplayTime: 2000 });

                          const summarizer = new SummarizerService(ProviderFactory, this.settings);
                          const summary = await summarizer.summarize(url);
                          Logger.log('Summary received:', summary);

                          if (this.settings.localMode || message.author.id !== UserStore.getCurrentUser().id) {
                              message.content = summary;

                              EmbedUtils[sanitizeEmbedProp] = (channelId, embedId, embed) => embed;

                              Dispatcher.dispatch({
                                  type: 'MESSAGE_UPDATE',
                                  message: message,
                              });
                          } else {
                              await MessageActions.editMessage(message.channel_id, message.id, { content: summary });
                          }

                          Toasts.updateToast(key, 'Summarized successfully!', { type: 'success', expires: true });
                      } catch (error) {
                          this.handleError(key, error);
                      } finally {
                          EmbedUtils[sanitizeEmbedProp] = ogSanitizeEmbed;
                      }
                  }

                  handleError(key, error) {
                      Logger.err(error);
                      let errorMessage = 'Failed to summarize article. Please try again.';
                      if (error.message.includes('API request failed') || error.message.includes('Invalid API key')) {
                          errorMessage = 'Failed to summarize article. Please check your API key.';
                      } else if (error.message.includes('Failed to fetch article content')) {
                          errorMessage = 'Failed to fetch article content. Please check the URL.';
                      } else if (error.message.includes('Invalid settings.')) {
                          errorMessage = 'Invalid plugin settings detected. Please check your configuration.';
                      } else {
                          errorMessage = error;
                      }
                      Toasts.updateToast(key, errorMessage, { type: 'error', expires: true });
                  }

                  onStop() {
                      ContextMenu.unpatch('message', this.messageContextPatch);
                  }

                  getSettingsPanel() {
                      return this.settingPanel.getPanel();
                  }

                  saveSettings() {
                      Utilities.saveSettings(config.info.name, this.settings);
                  }
              };
          };
          return plugin(Pl, Lib);
      })(global.ZeresPluginLibrary.buildPlugin(config));
