/// <reference path="types.d.ts" />
(() => {
    //@ts-ignore
    const extension = chrome ?? browser;

    const script = document.createElement('script');
    let src = '';

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
                        version: extension.runtime.getManifest().version,
                    },
                });
                break;
            }
        }
    });

    if (location.pathname === '/') {
        // トップページ書き換えスクリプト
        src = 'dist/index_rewrite.js';
    } else if ([
        '/mod/assign/view.php',
        '/mod/questionnaire/view.php',
        '/mod/feedback/complete.php',
    ].includes(location.pathname)) {
        // オンラインテキストエディタの文字数をカウントするスクリプト
        src = 'dist/olt_enhance.js';
    }
    
    if (!src) return;

    script.src = extension.runtime.getURL(src);
    document.body.appendChild(script);    
})();
