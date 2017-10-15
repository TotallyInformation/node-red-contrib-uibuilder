/**
 * Webpack Configuration
 */

const webpack        = require("webpack"),
      UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
      //ClosureCompilerPlugin = require('webpack-closure-compiler'),
      path           = require('path')

module.exports = {
    entry: {
        'uibuilderfe': path.join(__dirname, 'nodes', 'src', 'uibuilderfe.js')
    },
    devtool: "source-map",
    output: {
        path: path.join(__dirname, 'nodes', 'dist'),
        filename: '[name].min.js'
    },
    plugins: [
        /*
        new UglifyJSPlugin({
            sourceMap: true,
            uglifyOptions: {
                compress: {
                    keep_fnames: true
                },
                //mangle: false /*,
                mangle: {
                    keep_fnames: true,
                    reserved: ['uibuilder']
                }
                
            }
        })
        */
        /*
        new ClosureCompilerPlugin({
            compiler: {
              language_in: 'ECMASCRIPT6',
              language_out: 'ECMASCRIPT5',
              compilation_level: 'ADVANCED'
            },
            jsCompiler: true,
            //concurrency: 3,
        })
        // */
    ],
    resolve: {
        extensions: [‘’, ‘.js’]
    }
}
