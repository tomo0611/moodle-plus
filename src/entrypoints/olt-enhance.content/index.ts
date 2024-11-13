import { compatibleWebsiteHostnames } from '@/const';
import { main } from './olt_enhance';

export default defineContentScript({
    matches: compatibleWebsiteHostnames.flatMap((hostname) => [
        `*://${hostname}/mod/assign/view.php*`,
        `*://${hostname}/mod/questionnaire/view.php*`,
        `*://${hostname}/mod/feedback/complete.php*`,
    ]),
    main(ctx) {
        const ui = createIntegratedUi(ctx, {
            position: 'inline',
            anchor: 'body',
            onMount() {
                main();
            },
        });

        ui.mount();
    },
});
