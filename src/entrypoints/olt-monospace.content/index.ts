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

                const pos = textarea.selectionStart ?? 0;
                const posEnd = textarea.selectionEnd ?? textarea.value.length;

                if (ev.code === 'Enter') {
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
                    ev.preventDefault();
                    const tabText = '    ';

                    // 複数行選択の処理
                    if (pos !== posEnd && textarea.value.slice(pos, posEnd).includes('\n')) {
                        const lines = textarea.value.split('\n');
                        const startLine = textarea.value.slice(0, pos).split('\n').length - 1;
                        const endsWithNewline = posEnd > pos && textarea.value[posEnd - 1] === '\n';
                        const endLine = textarea.value.slice(0, posEnd).split('\n').length - 1 - (endsWithNewline ? 1 : 0);
                        
                        let totalCharsAdded = 0;
                        for (let i = startLine; i <= endLine; i++) {
                            lines[i] = tabText + lines[i];
                            totalCharsAdded += tabText.length;
                        }

                        textarea.value = lines.join('\n');
                        textarea.setSelectionRange(pos + tabText.length, posEnd + totalCharsAdded);
                    } else {
                        // 選択なし、または単一行選択
                        textarea.value = textarea.value.slice(0, pos) + tabText + textarea.value.slice(posEnd);
                        textarea.setSelectionRange(pos + tabText.length, pos + tabText.length);
                    }
                }
            });
        });
    },
});
