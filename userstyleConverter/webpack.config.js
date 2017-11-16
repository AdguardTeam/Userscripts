const webpack = require('webpack');
const path = require('path');



const config = {
    entry: "./index.js",

    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    },

    devServer: {
        inline: true,
        port: 7777,
        contentBase: __dirname + '/public/'
    },

    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]

    },

    plugins: []

};


if (process.env.NODE_ENV === 'production') {

    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {}
        })
    );
    config.module.loaders.push({
        test: /\.js$/,
        loader: "babel-loader",
        include: [path.resolve(__dirname, "index.js"),path.resolve(__dirname, "builder.js")],
        query: {
            "presets": [ "es2015" ] 
        }
    });
}

module.exports = config;
