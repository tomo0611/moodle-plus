import { useAppConfig } from 'wxt/client';
import { main } from './olt_enhance';

const appConfig = useAppConfig();

export default defineContentScript({
    matches: appConfig.compatibleWebsiteHostnames.flatMap((hostname) => [
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
