import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// @ts-ignore
import path from 'path';

import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), visualizer()],
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
        rollupOptions: {
            output: {
                manualChunks: id => {
                    if (!id.includes('node_modules')) {
                        return 'application-bundle';
                    }

                    if (id.includes('libsodium' || 'tweetnacl')) {
                        return 'libsodium-tweetnacl';
                    }

                    if (id.includes('@polkadot')) {
                        return 'polkadot';
                    }

                    if (id.includes('@polkadot/types')) {
                        return 'polkadot/types';
                    }

                    if (id.includes('@jimber')) {
                        return 'jimber-bundle';
                    }

                    if (id.includes('stellar')) {
                        return 'stellar';
                    }

                    if (id.includes('node-forge')) {
                        return 'node-forge';
                    }

                    if (id.includes('lodash')) {
                        return 'lodash';
                    }

                    if (id.includes('headlessui')) {
                        return '@headlessui';
                    }

                    if (id.includes('@vue') || id.includes('vue-router')) {
                        return 'vue';
                    }

                    return 'vendor';
                },
            },
        },
    },
});
