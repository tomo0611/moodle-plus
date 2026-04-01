import { sites } from '@/const';
import type {
    PostMessageDataFromExtension,
    PostMessageDataFromInjectedScript,
} from '@/types/messages';

export default defineContentScript({
    matches: sites.flatMap(site => [
        `*://${site.hostname}${site.basePath ?? ''}/`,
        `*://${site.hostname}${site.basePath ?? ''}/?*`,
        `*://${site.hostname}${site.basePath ?? ''}/index.php`,
        `*://${site.hostname}${site.basePath ?? ''}/index.php?*`,
    ]), // トップページ
    allFrames: true,
    async main(ctx) {
        function postMessageToInjectedScript(data: PostMessageDataFromExtension[keyof PostMessageDataFromExtension]) {
            console.log('[Moodle Plus] Post message to injected script:', data);
            window.postMessage(data, '*');
        }
        
        window.addEventListener('message', async (event) => {
            if (event.source !== window) return;
            const data: PostMessageDataFromInjectedScript[keyof PostMessageDataFromInjectedScript] = event.data;
            if (!data) return;
    
            switch (data.type) {
                case 'moodlePlus:misc:requestGetVersion': {
                    postMessageToInjectedScript({
                        type: 'moodlePlus:misc:getVersion',
                        payload: {
                            version: browser.runtime.getManifest().version,
                        },
                    });
                    break;
                }
            }
        });

        // IndexのリライトではWindowのセッションキーを使うため、Unlisted Scriptで実行する
        await injectScript('/index-rewrite.js', {
            keepInDom: true,
        });
    },
});
