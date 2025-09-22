import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		// nodePolyfills({
		// 	include: ['crypto', 'stream', 'util'],
		// 	globals: {
		// 		Buffer: true,
		// 		global: true,
		// 		process: true,
		// 	},
		// }),

		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
	],
	define: {
		global: "globalThis",
	},
});
