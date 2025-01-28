import adapter from "@sveltejs/adapter-static";

const dev = process.env.NODE_ENV === 'development';
const repoName = 'currency-converter';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html'
		}),
		paths: {
			base: dev ? '' : `/${repoName}`
		}
	}
};

export default config;
