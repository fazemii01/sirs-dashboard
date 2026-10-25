import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Auto-sync DLH logo from sirs/public to sirs-newdashboard/public
try {
    await fs.copyFile(
        resolve(__dirname, '../sirs/public/logo-dlh.png'),
        resolve(__dirname, 'public/logo-dlh.png')
    );
} catch (e) {
    // fallback if file already copied or inaccessible
}

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
            '@': resolve(__dirname, 'src'),
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'load-js-files-as-tsx',
                    setup(build: { onLoad: (arg0: { filter: RegExp; }, arg1: (args: any) => Promise<{ loader: string; contents: string; }>) => void; }) {
                        build.onLoad(
                            { filter: /src\\.*\.js$/ },
                            async (args) => ({
                                loader: 'tsx',
                                contents: await fs.readFile(args.path, 'utf8'),
                            })
                        );
                    },
                },
            ],
        },
    },

    plugins: [svgr(), react()],
});
