import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/src'),
            process: 'process/browser',
            stream: 'stream-browserify',
            Buffer: 'safe-buffer',
            util: path.resolve(__dirname, 'node_modules/util'),
        },
    },
    build: {
        minify: false,
        target: ['ESNext'],
    },
});
