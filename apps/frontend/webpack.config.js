const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
    mode,
    entry: './src/main.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    stats: {
        errorDetails: true,
    },
    experiments: {
        topLevelAwait: true,
    },
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
            },
        },
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
    },
    performance: { hints: mode === 'production' ? 'warning' : false },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Hot Module Replacement',
            template: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/assets',
                    to: 'assets',
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: './index.css',
        }),
        new VueLoaderPlugin(),
    ],
    module: {
        rules: [
            //Babel uses runtime to avoid injecting unnecessary code
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: ['@babel/preset-env'],
                            plugins: [
                                [
                                    'import',
                                    {
                                        libraryName: 'antd',
                                        style: true, // or 'css'
                                    },
                                    'antd',
                                ],
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            //Specify the specific TS compilation configuration to distinguish the TS configuration of the script
                            configFile: path.resolve(__dirname, './tsconfig.json'),
                            appendTsSuffixTo: [/\.vue$/],
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.vue$/,
                use: ['vue-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['', '.ts', '.js', '.vue'],
        alias: {
            vue: '@vue/runtime-dom',
        },
        fallback: {
            crypto: 'crypto-browserify',
            path: 'path-browserify',
            buffer: 'buffer',
            url: require.resolve('url'),
            https: require.resolve('https-browserify'),
            http: require.resolve('stream-http'),
        },
        plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
    },
};
