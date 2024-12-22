/** 動作確認が取れているMoodleのホスト名 */
export const stableCompatibleWebsiteHostnames = [
    "lms.omu.ac.jp",
    "moodle.s.kyushu-u.ac.jp",
    "elms.u-aizu.ac.jp",
    "sulms.shiga-u.ac.jp",
    "mdl.media.gunma-u.ac.jp",
    "cms.aitech.ac.jp",
    "wsdmoodle.waseda.jp",
];

/** 試験対応しているMoodleのホスト名（警告が表示される） */
export const experimentalCompatibleWebsiteHostnames = [
    // 試験対応 (Issue #25)
    "lms-m41.mie-u.ac.jp",
];

/** 対応しているMoodleのホスト名 */
export const compatibleWebsiteHostnames = [
    ...stableCompatibleWebsiteHostnames,
    ...experimentalCompatibleWebsiteHostnames,
];
