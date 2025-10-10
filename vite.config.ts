import commonjs from '@rollup/plugin-commonjs';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	build: {
		"rollupOptions": {
			plugins: [commonjs({
				dynamicRequireTargets: [
					'node_modules/@libsql/linux-x64-musl/index.node'
				],
				ignoreDynamicRequires: false
			})]
		}
	}
});
