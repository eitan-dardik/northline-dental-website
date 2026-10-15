import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// The app can't run without these. Vite bakes VITE_* values into the bundle at
// build time, so a build without them "succeeds" but ships a blank page.
const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];

export default defineConfig(({ command, mode }) => {
	if (command === 'build') {
		// Reads .env, .env.local, .env.[mode] and real environment variables (e.g. set on the host).
		const env = loadEnv(mode, rootDir, 'VITE_');
		const missing = REQUIRED_ENV.filter((key) => !env[key]);
		if (missing.length) {
			throw new Error(
				`Missing ${missing.join(', ')}. Copy apps/web/.env.example to apps/web/.env.local and fill it in.`
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