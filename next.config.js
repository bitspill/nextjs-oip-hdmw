// next.config.js is not transformed by Babel. So you can only use javascript features supported by your version of Node.js.
const withImages = require('next-images')

module.exports = withImages({
	webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
		// Perform customizations to webpack config
		// Important: return the modified config
		config.node = { fs: 'empty'}

		return config
	},
	webpackDevMiddleware: config => {
		// Perform customizations to webpack dev middleware config
		// Important: return the modified config
		return config
	}
})
