import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const config = {
    info: {
        name: 'Summarizer',
        authors: [
            {
                name: 'JanitorialMess',
                discord_id: '671095271412727854',
            },
        ],
        version: '1.0.0',
        description: 'Summarizes the content of articles linked in messages.',
    },
    defaultConfig: [
        {
            type: 'dropdown',
            id: 'provider',
            name: 'Provider',
            note: 'Select the provider for article summarization.',
            value: 'GoogleGemini',
            options: [
                // { label: 'OpenAI', value: 'OpenAI' },
                // { label: 'Azure OpenAI', value: 'AzureOpenAI' },
                // { label: 'Together', value: 'Together' },
                // { label: 'Cohere', value: 'Cohere' },
                // { label: 'Anthropic', value: 'Anthropic' },
                // { label: 'Mistral', value: 'Mistral' },
                // { label: 'Groq', value: 'Groq' },
                // { label: 'DeepSeek', value: 'DeepSeek' },
                // { label: 'Ollama', value: 'Ollama' },
                { label: 'Google Gemini', value: 'GoogleGemini' },
            ],
        },
        {
            type: 'dropdown',
            id: 'model',
            name: 'Model',
            note: 'Select the LLM model.',
            value: 'gemini-1.5-flash',
            options: [
                { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
                { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { label: 'Gemini 1.0 Pro', value: 'gemini-1.0-pro' },
                // { label: 'GPT-4o', value: 'gpt-4o' },
                // { label: 'GPT-4', value: 'gpt-4' },
                // { label: 'GPT-4-32k', value: 'gpt-4-32k' },
                // { label: 'GPT-3.5-turbo', value: 'gpt-3.5-turbo' },
                // { label: 'GPT-3.5-turbo-16k', value: 'gpt-3.5-turbo-16k' },
            ],
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
          const plugin = (Plugin, Library) => {
              const {
                  /* Library */
                  Utilities,
                  Logger,
                  ReactTools,

                  /* Settings */
                  SettingField,
                  SettingPanel,
                  SettingGroup,
                  Dropdown,
                  Textbox,

                  /* Discord Modules (From lib) */
                  React,
                  ReactDOM,
                  MessageStore,

                  /* BdApi */
                  ContextMenu,
                  Net,

                  /* Manually found modules */
                  TextArea,
              } = require('./utils/modules').ModuleStore;
              const { Readability } = require('@mozilla/readability');

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
                                  label: '✨ Summarize',
                                  action: () => {
                                      this.summarizeArticle(message);
                                  },
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
                      const apiKey = this.settings.apiKey;
                      const model = this.settings.model || 'gemini-1.5-flash';

                      if (!this.validateSettings()) {
                          return;
                      }

                      const ai = new ChatGoogleGenerativeAI({
                          apiKey,
                          model,
                          maxOutputTokens: 2048,
                      });

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
                          const res = await ai.invoke([
                              ['system', this.settings.systemPrompt],
                              ['human', template.replace('{{articleText}}', article).replace('{{aiName}}', model)],
                          ]);

                          let summary = res.content;
                          message.content = summary;
                          BdApi.showToast('Article summarized successfully!', {
                              type: 'success',
                          });
                      } catch (error) {
                          Logger.error('Error summarizing article:', error);
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
                              Logger.error(`HTTP error! status: ${response.status}`);
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
                          Logger.error('Error fetching article text:', error);
                          BdApi.showToast('Failed to fetch article content', {
                              type: 'error',
                          });
                      }
                  }

                  onStop() {
                      ContextMenu.unpatch('message', this.messageContextPatch);
                  }

                  getSettingsPanel = () => {
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
                              this.settings.provider,
                              [{ label: 'Google Gemini', value: 'GoogleGemini' }],
                              (value) => {
                                  this.settings.provider = value;
                              }
                          ),
                          new Dropdown(
                              'Model',
                              'Select the LLM model.',
                              this.settings.model,
                              [
                                  { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                                  { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
                                  { label: 'Gemini 1.0 Pro', value: 'gemini-1.0-pro' },
                              ],
                              (value) => {
                                  this.settings.model = value;
                              }
                          ),
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
