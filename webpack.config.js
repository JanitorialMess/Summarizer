const path = require('path');
const webpack = require('webpack');
const pluginConfig = require('./src/config.json');
const TerserPlugin = require('terser-webpack-plugin');
const process = require('process');

const meta = (() => {
    const lines = ['/**'];
    for (const key in pluginConfig) {
        lines.push(` * @${key} ${pluginConfig[key]}`);
    }
    lines.push(' */');
    return lines.join('\n');
})();

const commonConfig = {
    target: 'electron-renderer',
    devtool: false,
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs2',
        libraryExport: 'default',
        compareBeforeEmit: false,
    },
    resolve: {
        extensions: ['.jsx', '.js', '.css'],
    },
    module: {
        rules: [
            { test: /\.css$/, use: 'raw-loader' },
            { test: /\.jsx$/, exclude: /node_modules/, use: 'babel-loader' },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({ raw: true, banner: meta }),
        {
            apply: (compiler) => {
                compiler.hooks.assetEmitted.tap('Summarizer', (filename, info) => {
                    const userConfig = (() => {
                        if (process.platform === 'win32') return process.env.APPDATA;

                        if (process.platform === 'darwin') {
                            return path.join(process.env.HOME, 'Library', 'Application Support');
                        }

                        if (process.env.XDG_CONFIG_HOME) {
                            return process.env.XDG_CONFIG_HOME;
                        }

                        return path.join(process.env.HOME, 'Library', '.config');
                    })();

                    const fs = require('fs');
                    const bdFolder = path.join(userConfig, 'BetterDiscord');
                    fs.copyFileSync(info.targetPath, path.join(bdFolder, 'plugins', filename));
                });
            },
        },
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(pluginConfig.version),
        }),
    ],
};

// Configuration for minified output
const minifiedConfig = {
    ...commonConfig,
    mode: 'production',
    output: {
        ...commonConfig.output,
        filename: 'Summarizer.min.plugin.js',
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: /@/,
                    },
                },
                extractComments: false,
            }),
        ],
    },
};

// Configuration for non-minified output
const nonMinifiedConfig = {
    ...commonConfig,
    mode: 'development',
    output: {
        ...commonConfig.output,
        filename: 'Summarizer.plugin.js',
    },
    optimization: {
        minimize: false,
        splitChunks: false,
    },
};

function selectConfig() {
    switch (process.env.BUILD_TYPE) {
        case 'minified':
            return minifiedConfig;
        case 'non-minified':
            return nonMinifiedConfig;
        default:
            return nonMinifiedConfig;
    }
}

module.exports = selectConfig();
