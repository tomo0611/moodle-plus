import { useAppConfig } from 'wxt/client';
import { main } from './index_rewrite';

const appConfig = useAppConfig();

export default defineContentScript({
    matches: appConfig.compatibleWebsiteHostnames.map((hostname) => `*://${hostname}/`), // トップページ
    main(ctx) {
        function postMessageToInjectedScript(data: PostMessageDataFromExtension[keyof PostMessageDataFromExtension]) {
            console.log('[Moodle Plus] Post message to injected script:', data);
            //window.postMessage(data, '*');
        }
        
        /*
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
        */

        const ui = createIntegratedUi(ctx, {
            position: 'inline',
            anchor: 'body',
            onMount() {
                main();
            },
        });

        ui.mount();
    },
});
