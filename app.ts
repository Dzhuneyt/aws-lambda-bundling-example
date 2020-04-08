const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const argv = require('minimist')(process.argv.slice(2));

if (!argv['sourceFolder']) {
    throw new Error('--sourceFolder is required');
}
if (!argv['targetFolder']) {
    throw new Error('--targetFolder is required');
}

const sourceDir = path.resolve(__dirname, argv['sourceFolder']);
const targetDir = path.resolve(__dirname, argv['targetFolder']);

const handlers = fs.readdirSync(sourceDir).filter(function (file: string) {
    // Get only .ts files (ignore .d.ts)
    return file.match(/(^.?|\.[^d]|[^.]d|[^.][^d])\.ts$/);
});


const webpackEntries: {
    [key: string]: string;
} = {};

handlers.forEach((handler: string) => {
    const filenameWithoutExt = handler.replace('.ts', '');
    webpackEntries[filenameWithoutExt] = sourceDir + "/" + handler;
});

console.log(`Shrinking ${handlers.length} Lambdas`);
console.log(`Source directory: ${sourceDir}`);
console.log(`Target directory: ${targetDir}`);

const webpackConfig = {
    entry: webpackEntries,
    mode: 'production',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize: false
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, './lambdas'),
        ],
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        libraryTarget: 'umd',
        path: targetDir,
        filename: "[name].js"
    },
};

webpack(webpackConfig, (err: any, stats: { hasErrors: () => any; toString: (obj: any) => {} }) => { // Stats Object
    if (err) {
        throw new Error(err);
    }

    console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console
    }));
});
