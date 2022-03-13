const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/command/main.ts',
    target: 'node',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "sqlproj-analysis.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
    ]
};
