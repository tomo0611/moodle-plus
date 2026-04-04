export type SiteConfig = {
    /** Moodleのホスト名 */
    hostname: string;
    /** Moodleのベースパス（末尾スラッシュなし） */
    basePath?: string;
    /** Moodleのサイト名 or 採用機関名 */
    name: string;
    /** 試験対応？ */
    experimental?: boolean;
};

export const sites: SiteConfig[] = [
    {
        hostname: 'lms.omu.ac.jp',
        name: '大阪公立大学',
    },
    {
        hostname: 'moodle.s.kyushu-u.ac.jp',
        name: '九州大学',
    },
    {
        hostname: 'elms.u-aizu.ac.jp',
        name: '会津大学',
    },
    {
        hostname: 'sulms.shiga-u.ac.jp',
        name: '滋賀大学',
    },
    {
        hostname: 'mdl.media.gunma-u.ac.jp',
        name: '群馬大学',
    },
    {
        hostname: 'cms.aitech.ac.jp',
        name: '愛知工業大学',
    },
    {
        hostname: 'lms-m41.mie-u.ac.jp',
        name: '三重大学 (Moodle v4.1)',
        experimental: true,
    },
    {
        hostname: 'wsdmoodle.waseda.jp',
        name: 'Waseda Moodle',
    },
    {
        hostname: 'ict-i.el.kyutech.ac.jp',
        name: '九州工業大学（飯塚, v4.1）',
        experimental: true,
    },
    {
        hostname: 'ict-t.el.kyutech.ac.jp',
        name: '九州工業大学（戸畑・若松, v4.1）',
        experimental: true,
    },
    {
        hostname: 'im10.el.kyutech.ac.jp',
        basePath: '/2026',
        name: '九州工業大学（飯塚, v4.5）',
        experimental: true,
    },
    {
        hostname: 'tm10.el.kyutech.ac.jp',
        basePath: '/2026',
        name: '九州工業大学（戸畑・若松, v4.5）',
        experimental: true,
    },
    {
        hostname: 'online.ouj.ac.jp',
        name: '放送大学オンライン授業',
        experimental: true,
    },
    {
        hostname: 'agulms45.aim.aoyama.ac.jp',
        name: '青山学院大学',
    },
    {
        hostname: 'moodle.kochi-u.ac.jp',
        basePath: '/2026',
        name: '高知大学（2026年度版）',
        experimental: true,
    },
    {
        hostname: 'moodle2026.wakayama-u.ac.jp',
        basePath: '/2026',
        name: '和歌山大学（2026年度版）',
        experimental: true,
    },
    {
        hostname: 'blend.el-kait.jp',
        name: 'KAIT Moodle（神奈川工科大学）',
        experimental: true,
    },
];

/** 対応しているMoodleのホスト名 */
export const compatibleWebsiteHostnames = sites.map(site => site.hostname);
