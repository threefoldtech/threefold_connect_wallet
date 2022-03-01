import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// @ts-ignore
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
            util: 'util',
        },
    },
    server: {
        proxy: {
            '/api/v1': {
                target: 'http://localhost:5000',
            },
        },
    },

    build: {
        minify: false,
        target: ['ESNext'],
    },
});
