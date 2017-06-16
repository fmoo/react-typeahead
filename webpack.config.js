'use strict';

const pathJoin = require('path').join;
const wpUglifyJsPlugin = require('webpack').optimize.UglifyJsPlugin;
const wpDefinePlugin = require('webpack').DefinePlugin;
const wpLoaderOptionsPlugin = require('webpack').LoaderOptionsPlugin;

module.exports = (ARGS = {}) => {
	const PATH_ROOT = pathJoin(__dirname);
	const PATH_APP_ENTRY = pathJoin(PATH_ROOT, 'src');
	const PATH_OUTPUT = pathJoin(PATH_ROOT, 'dist');

	const envPlugins = [
    new wpUglifyJsPlugin({
      compress: {warnings: false, unused: true, dead_code: true},
      output: {comments: false}
    })
  ];
  
	return Object.assign({}, {
		entry: {
			app: ['babel-polyfill', PATH_APP_ENTRY],
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
		resolve: {
			extensions: ['.js'],
			modules: ['node_modules', PATH_ROOT],
		},
		plugins: envPlugins.concat([
			new wpLoaderOptionsPlugin({ debug: false, minimize: false }),
			new wpDefinePlugin({
				'process.env': { NODE_ENV: 'production' },
			})
		]),
	});
};
