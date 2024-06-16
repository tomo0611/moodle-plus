(() => {
    const script = document.createElement('script');
    let src = '';
    
    if (location.pathname === '/') {
        // トップページ書き換えスクリプト
        src = 'dist/index_rewrite.js';
    } else if ([
        '/mod/quiz/view.php',
        '/mod/assign/view.php',
        '/mod/questionnaire/view.php',
    ].includes(location.pathname)) {
        // オンラインテキストエディタの文字数をカウントするスクリプト
        src = 'dist/olt_enhance.js';
    }
    
    if (!src) return;

    if (chrome) {
        script.src = chrome.runtime.getURL(src);
    } else {
        //@ts-ignore
        script.src = browser.runtime.getURL(src);
    }
    document.body.appendChild(script);    
})();
