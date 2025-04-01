import { defineConfig, type UserManifest } from 'wxt';
import { compatibleWebsiteHostnames } from './src/const';

// See https://wxt.dev/api/config.html
export default defineConfig({
    // Directory
    srcDir: 'src',
    outDir: 'dist',

    // Manifest
    manifestVersion: 3,
    manifest: ({ browser }) => {
        const manifest: UserManifest = {
            name: 'Moodle Plus',
            description: 'Moodleにちょっとした機能を追加します!',
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
        };

        if (browser === 'firefox') {
            // @ts-expect-error Chromeの型を使っているので異なる
            manifest.author = 'tomo0611';
            manifest.browser_specific_settings = {
                gecko: {
                    id: 'moodleplus@tomo0611',
                    strict_min_version: '109.0',
                },
            };
        } else {
            manifest.author = {
                email: 'tomo0611@hotmail.com',
            };
        }

        return manifest;
    },
});
