const script = document.createElement('script');
if (chrome) {
    script.src = chrome.runtime.getURL('dist/content_script.js');
} else {
    //@ts-ignore
    script.src = browser.runtime.getURL('dist/content_script.js');
}
document.body.appendChild(script);
