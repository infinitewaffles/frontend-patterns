// postcss.config.js
const plugins = {
	'postcss-rem': {},
	autoprefixer: {},
	cssnano: { preset: 'default' }
};

const production_plugins = {
	'@fullhuman/postcss-purgecss': {
		content: ['./**/*.tsx']
	}
};

module.exports = {
	plugins: process.env.NODE_ENV === 'production' ? { ...plugins, ...production_plugins } : plugins
};
