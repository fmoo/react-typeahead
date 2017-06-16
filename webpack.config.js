'use strict';

const pathJoin = require('path').join;
const wpUglifyJsPlugin = require('webpack').optimize.UglifyJsPlugin;
const wpDefinePlugin = require('webpack').DefinePlugin;
const wpLoaderOptionsPlugin = require('webpack').LoaderOptionsPlugin;

module.exports = (ARGS = {}) => {
	const PATH_ROOT = pathJoin(__dirname);
	const PATH_APP_ENTRY = pathJoin(PATH_ROOT, 'src');
	const PATH_OUTPUT = pathJoin(PATH_ROOT, 'dist');
  
	return Object.assign({}, {
		entry: {
			app: [PATH_APP_ENTRY],
		},
		output: {
			path: PATH_OUTPUT,
			filename: 'react-typeahead.js',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					include: [
						pathJoin(PATH_APP_ENTRY),
					],
					exclude: [],
					loader: 'babel-loader',
					options: {
						presets: ['react', 'es2015', 'stage-0'],
						plugins: [],
					},
				},
			],
		},
		plugins: [
			new wpLoaderOptionsPlugin({ 
				debug: false, 
				minimize: false 
			}),
			new wpDefinePlugin({
				'process.env': { 
					NODE_ENV: JSON.stringify('production')
				},
			}),
			new wpUglifyJsPlugin({
				compress: {
					warnings: false, 
					unused: true, 
					dead_code: true
				},
				output: {
					comments: false
				}
			})
		],
	});
};