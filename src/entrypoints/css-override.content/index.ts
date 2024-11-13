import './main.css';
import { useAppConfig } from 'wxt/client';

const appConfig = useAppConfig();

// LMS全体のスタイルオーバーライド
export default defineContentScript({
    matches: appConfig.compatibleWebsiteHostnames.map((hostname) => `*://${hostname}/*`),
    cssInjectionMode: 'manifest',
    main(ctx) {
        // do nothing
    },
});
