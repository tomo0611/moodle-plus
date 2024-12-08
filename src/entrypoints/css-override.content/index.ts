import './main.css';
import { compatibleWebsiteHostnames } from '@/const';

// LMS全体のスタイルオーバーライド
export default defineContentScript({
    matches: compatibleWebsiteHostnames.map((hostname) => `*://${hostname}/*`),
    cssInjectionMode: 'manifest',
    main() {
        // do nothing
    },
});
