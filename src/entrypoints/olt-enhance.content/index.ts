import { sites } from '@/const';
import { main as oltEnhance } from './olt_enhance';

export default defineContentScript({
    matches: sites.flatMap((site) => [
        `*://${site.hostname}${site.basePath ?? ''}/mod/assign/view.php*`,
        `*://${site.hostname}${site.basePath ?? ''}/mod/questionnaire/view.php*`,
        `*://${site.hostname}${site.basePath ?? ''}/mod/feedback/complete.php*`,
    ]),
    allFrames: true,
    main() {
        oltEnhance();
    },
});
