const path = require('path');

module.exports = {
    entry: './src/command/index.ts',
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
    }
};
