import { compatibleWebsiteHostnames } from '@/const';

export default defineContentScript({
    matches: compatibleWebsiteHostnames.flatMap((hostname) => [
        `*://${hostname}/mod/assign/view.php*`,
        `*://${hostname}/mod/questionnaire/view.php*`,
        `*://${hostname}/mod/feedback/complete.php*`,
        `*://${hostname}/mod/quiz/attempt.php*`,
    ]),
    main() {
        const textareas = document.querySelectorAll<HTMLTextAreaElement>('.que.essay textarea.qtype_essay_response.qtype_essay_monospaced');

        textareas.forEach((textarea) => {
            textarea.addEventListener('keydown', (ev) => {
                // IME変換中は無視
                if (ev.isComposing || ev.key === 'Process' || ev.keyCode === 229) {
                    return;
                }

                if (ev.code === 'Enter') {
                    const pos = textarea.selectionStart ?? 0;
                    const posEnd = textarea.selectionEnd ?? textarea.value.length;
                    if (pos === posEnd) {
                        const lines = textarea.value.slice(0, pos).split('\n');
                        const currentLine = lines[lines.length - 1];
                        const currentLineSpaces = currentLine.match(/^\s+/);
                        const posDelta = currentLineSpaces ? currentLineSpaces[0].length : 0;
                        ev.preventDefault();
                        textarea.value = textarea.value.slice(0, pos) + '\n' + (currentLineSpaces ? currentLineSpaces[0] : '') + textarea.value.slice(pos);
                        textarea.setSelectionRange(pos + 1 + posDelta, pos + 1 + posDelta);
                    }
                }

                if (ev.code === 'Tab') {
                    const pos = textarea.selectionStart ?? 0;
                    const posEnd = textarea.selectionEnd ?? textarea.value.length;
                    textarea.value = textarea.value.slice(0, pos) + '    ' + textarea.value.slice(posEnd);
                    textarea.setSelectionRange(pos + 4, pos + 4);
                    ev.preventDefault();
                }
            });
        });
    },
});
