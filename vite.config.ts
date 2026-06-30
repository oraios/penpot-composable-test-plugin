import { defineConfig } from "vite";

// Builds the plugin sandbox entry (plugin.js) and the UI (index.html) into dist/,
// alongside the static manifest + icon copied from public/.
export default defineConfig({
    base: "./",
    build: {
        rollupOptions: {
            input: {
                plugin: "src/plugin.ts",
                index: "./index.html",
            },
            output: {
                entryFileNames: "[name].js",
            },
        },
    },
    preview: {
        port: 4410,
        cors: true,
    },
});
