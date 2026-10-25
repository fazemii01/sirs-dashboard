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
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
            },
        },
    },
    preview: {
        host: '0.0.0.0',
        port: 5000,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3001',
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
    build: {
        chunkSizeWarningLimit: 2500,
    },
    plugins: [svgr(), react()],
});
