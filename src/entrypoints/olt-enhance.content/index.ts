import { compatibleWebsiteHostnames } from '@/const';
import { main as oltEnhance } from './olt_enhance';

export default defineContentScript({
    matches: compatibleWebsiteHostnames.flatMap((hostname) => [
        `*://${hostname}/mod/assign/view.php*`,
        `*://${hostname}/mod/questionnaire/view.php*`,
        `*://${hostname}/mod/feedback/complete.php*`,
    ]),
    main() {
        oltEnhance();
    },
});
