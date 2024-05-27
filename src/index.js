const config = {
    info: {
        name: 'Summarizer',
        authors: [
            {
                name: 'JanitorialMess',
                discord_id: '671095271412727854',
            },
        ],
        version: '0.2.1',
        description: 'Summarizes the content of articles linked in messages.',
    },
    changelog: [
        {
            title: 'Bugfixes',
            type: 'fixed',
            items: ['Fixed delay in rendering the summary'],
        },
        {
            title: 'Feature',
            type: 'added',
            items: ['Added support for new AI providers and models'],
        },
    ],
    defaultConfig: [
        {
            type: 'dropdown',
            id: 'provider',
            name: 'Provider',
            note: 'Select the provider for article summarization.',
            value: 'GoogleGemini',
            options: [],
        },
        {
            type: 'dropdown',
            id: 'model',
            name: 'Model',
            note: 'Select the LLM model.',
            value: 'gemini-1.5-flash',
            options: [],
        },
        {
            type: 'textbox',
            id: 'apiKey',
            name: 'API Key',
            note: 'Enter your API key for the selected provider.',
            value: '',
        },
        {
            type: 'textbox',
            id: 'systemPrompt',
            name: 'System Prompt',
            note: 'Enter the system prompt for the AI assistant. Leave empty to use the default prompt.',
            value: 'You are an AI assistant that summarizes articles. You are not allowed to modify the template in any way besides inserting the necessary text. You are not allowed to remove any of the markdown symbols. Your answers should be relevant, concise, and informative. You are explicitly given permission to generate as many or few key points as necessary, in which case you can modify the template to increment or decrement the key points. The same is valid for main topics',
        },
        {
            type: 'textbox',
            id: 'summaryTemplate',
            name: 'Summary Template',
            note: 'Enter the template for the article summary in markdown format. Use {{link}} as a placeholder for the article URL.',
            value: `## 📰 Article Summary
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
`,
        },
    ],
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
              const { Readability } = require('@mozilla/readability');
              const {
                  /* Library */
                  Utilities,
                  Logger,
                  Dispatcher,

                  /* Settings */
                  SettingField,
                  SettingPanel,
                  Dropdown,
                  Textbox,

                  /* Discord Modules (From lib) */
                  React,
                  MessageStore,

                  /* BdApi */
                  ContextMenu,
                  Net,

                  /* Manually found modules */
                  TextArea,
              } = require('./utils/modules').ModuleStore;
              const ProviderFactory = require('./providers/providers');

              const defaultSettings = config.defaultConfig.reduce((acc, cur) => {
                  acc[cur.id] = cur.value;
                  return acc;
              }, {});

              return class Summarizer extends Plugin {
                  constructor() {
                      super();
                      this.settings = Utilities.loadData(config.info.name, 'settings', defaultSettings);
                  }

                  async onStart() {
                      ContextMenu.patch('message', this.messageContextPatch);
                  }

                  messageContextPatch = (ret, props) => {
                      const children = ret.props.children;
                      const message = MessageStore.getMessage(props.channel.id, props.message.id);

                      if (
                          message &&
                          message.content &&
                          message.content.match(/https?:\/\/\S+/gi) &&
                          !message.content.includes('📝 Article Summary')
                      ) {
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
                                          className: 'icon__0bfbf',
                                          ariaHidden: true,
                                          role: 'img',
                                          xmlns: 'http://www.w3.org/2000/svg',
                                          width: 24,
                                          height: 24,
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
                      if (!this.settings.apiKey) {
                          BdApi.showToast('Please enter an API key', {
                              type: 'error',
                          });
                          return false;
                      }
                      if (!this.settings.systemPrompt) {
                          BdApi.showToast('Please enter a system prompt', {
                              type: 'error',
                          });
                          return false;
                      }
                      if (!this.settings.summaryTemplate) {
                          BdApi.showToast('Please enter a summary template', {
                              type: 'error',
                          });
                          return false;
                      }
                      return true;
                  }

                  async summarizeArticle(message) {
                      const link = message.content.match(/https?:\/\/\S+/gi)[0];
                      const { provider: providerId, model, apiKey } = this.settings;

                      if (!this.validateSettings()) {
                          return;
                      }

                      const ai = ProviderFactory.createProvider(providerId, model, apiKey);

                      const template = `
                      Please summarize the following article using the provided template:
              
                      Article URL: ${link}
              
                      Template:
                      ${this.settings.summaryTemplate.replace('{{link}}', link)}
              
                      Article Text:
                      {{articleText}}
                      
                      Summary:
                      `;

                      try {
                          const article = await this.fetchArticleText(link);
                          if (!article) return;

                          const res = await ai.invoke([
                              ['system', this.settings.systemPrompt],
                              ['human', template.replace('{{articleText}}', article).replace('{{aiName}}', model)],
                          ]);
                          const summary = res.content;
                          message.content = summary;
                          Dispatcher.dispatch({
                              type: 'MESSAGE_UPDATE',
                              message: message,
                          });
                          BdApi.showToast('Article summarized successfully!', {
                              type: 'success',
                          });
                      } catch (error) {
                          Logger.err('Error summarizing article:', error);
                          BdApi.showToast('Failed to summarize article. Please try again.', {
                              type: 'error',
                          });
                      }
                  }

                  async fetchArticleText(link) {
                      try {
                          const response = await Net.fetch(link, {
                              method: 'GET',
                              headers: {
                                  'User-Agent':
                                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
                              },
                          });

                          if (!response.ok) {
                              Logger.err(`HTTP error! status: ${response.status}`);
                              BdApi.showToast('Failed to fetch article content', {});
                              return;
                          }

                          const html = await response.text();
                          const doc = new DOMParser().parseFromString(html, 'text/html');
                          const reader = new Readability(doc);
                          const article = reader.parse();

                          if (article) {
                              return article.textContent.trim();
                          } else {
                              BdApi.showToast('Failed to extract article content', {
                                  type: 'error',
                              });
                              return;
                          }
                      } catch (error) {
                          Logger.err('Error fetching article text:', error);
                          BdApi.showToast('Failed to fetch article content', {
                              type: 'error',
                          });
                      }
                  }

                  onStop() {
                      ContextMenu.unpatch('message', this.messageContextPatch);
                  }

                  getSettingsPanel = () => {
                      const availableProviders = ProviderFactory.getAvailableProviders();
                      const providerOptions = availableProviders.map((provider) => ({
                          label: provider.label,
                          value: provider.id,
                      }));

                      const modelOptions = availableProviders.reduce((options, provider) => {
                          const providerModels = provider.classRef.getAvailableModels().map((model) => ({
                              label: `${model.label}`,
                              value: model.value,
                          }));
                          return [...options, ...providerModels];
                      }, []);

                      class TextAreaField extends SettingField {
                          constructor(name, note, value, onChange, options) {
                              const { placeholder = '', disabled = false } = options;
                              super(name, note, onChange, TextArea, {
                                  onChange: (textarea) => (val) => {
                                      textarea.props.value = val;
                                      textarea.forceUpdate();
                                      this.onChange(val);
                                  },
                                  value: value,
                                  disabled: disabled,
                                  autosize: true,
                                  placeholder: placeholder || '',
                              });
                          }
                      }
                      return SettingPanel.build(
                          this.saveSettings.bind(this),

                          new Dropdown(
                              'Provider',
                              'Select the provider for article summarization.',
                              this.settings.provider || availableProviders[0].id,
                              providerOptions,
                              (value) => {
                                  this.settings.provider = value;
                              }
                          ),
                          new Dropdown('Model', 'Select the LLM model.', this.settings.model, modelOptions, (value) => {
                              this.settings.model = value;
                          }),
                          new Textbox('API Key', 'Enter your API key for the selected provider.', this.settings.apiKey, (value) => {
                              this.settings.apiKey = value;
                          }),
                          new TextAreaField(
                              'System Prompt',
                              'Enter the system prompt for the AI assistant. Leave empty to use the default prompt.',
                              this.settings.systemPrompt,
                              (value) => {
                                  this.settings.systemPrompt = value;
                              },
                              { placeholder: 'Enter the system prompt here...' }
                          ),
                          new TextAreaField(
                              'Summary Template',
                              'Enter the template for the article summary in markdown format. Use {{link}} as a placeholder for the article URL.',
                              this.settings.summaryTemplate,
                              (value) => {
                                  this.settings.summaryTemplate = value;
                              },
                              { placeholder: 'Enter the summary template here...' }
                          )
                      );
                  };

                  saveSettings() {
                      Utilities.saveData(config.info.name, 'settings', this.settings);
                  }
              };
          };
          return plugin(Pl, Lib);
      })(global.ZeresPluginLibrary.buildPlugin(config));
