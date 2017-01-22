const webpack = require("webpack");
const fs = require("fs");
const babelConfig = JSON.stringify({
	"presets": [
		["es2015", {"loose": true}],
		"react",
		"stage-2"
	]
});
module.exports = {
	context: __dirname,
	entry: './examples/example.jsx',
	output: {
		path: "./examples/",
		filename: "example.js"
	},
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader'
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
	]
};
