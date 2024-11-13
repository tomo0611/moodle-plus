import { defineConfig } from 'wxt';
import { compatibleWebsiteHostnames } from './src/const';

// See https://wxt.dev/api/config.html
export default defineConfig({
    // Directory
    srcDir: 'src',
    outDir: 'dist',

    // Config
    extensionApi: 'chrome',
    modules: ['@wxt-dev/module-vue'],

    // Manifest
    manifestVersion: 3,
    manifest: {
        name: 'Moodle Plus',
        description: 'Moodleにちょっとした機能を追加します!',
        author: {
            email: 'tomo0611@hotmail.com',
        },
        icons: {
            16: '/icons/icon16.png',
            32: '/icons/icon32.png',
            48: '/icons/icon48.png',
            128: '/icons/icon128.png',
            240: '/icons/icon240.png',
        },
        web_accessible_resources: [{
            resources: ['index-rewrite.js'],
            matches: compatibleWebsiteHostnames.map((hostname) => `https://${hostname}/*`),
        }],
    },
});
