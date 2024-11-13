import { defineAppConfig } from 'wxt/sandbox';

declare module 'wxt/sandbox' {
    export interface WxtAppConfig {
        compatibleWebsiteHostnames: string[];
    }
}

export default defineAppConfig({
    // 対応するLMSのホスト名
    compatibleWebsiteHostnames: [
        "lms.omu.ac.jp",
        "moodle.s.kyushu-u.ac.jp",
        "elms.u-aizu.ac.jp",
        "sulms.shiga-u.ac.jp",
        "mdl.media.gunma-u.ac.jp",
        "cms.aitech.ac.jp"
    ],
});
