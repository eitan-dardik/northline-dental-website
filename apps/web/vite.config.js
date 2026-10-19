//This runs on node, on the build machine (i.e Hostinger's build server), once at the start of each build.
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// Vite bakes VITE_* values into the bundle at build time. If one is missing the
// site still builds: it shows the failure message with the fallback phone, 
// it warns the developer here instead of stopping the build. Values are set per site in hPanel.
const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];

export default defineConfig(({ command, mode }) => {
	if (command === 'build') {
		// Reads .env, .env.local, .env.[mode] and real environment variables (e.g. set in hPanel)
		const env = loadEnv(mode, rootDir, 'VITE_');
		//same "missing" rule as clean() in src/lib/config/env.js. Keep env.js and  vite.config.js in step.
		const missing = REQUIRED_ENV.filter((key) => !(env[key] ?? '').trim());
		if (missing.length) {
			console.warn(
				`\nWARNING: missing ${missing.join(', ')}. The build continues; the site will show ` +
				`the failure message with the fallback phone. Set it per site in hPanel ` +
				`(locally: apps/web/.env.local).\n`
			);
		}
	}

	return {
		plugins: [react()],
		server: {
			port: 3000,
		},
		resolve: {
			extensions: ['.jsx', '.js', '.json'],
			alias: {
				'@': `${rootDir}src`,
			},
		},
	};
});