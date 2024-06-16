(() => {
    // オンラインテキストエディタの文字数をカウントするスクリプト

    console.log("[Moodle Plus] olt enhance script loaded. Waiting for page load");

    // atto editorがマウントされるまで待つ
    window.addEventListener('load', () => {

        const attoEditor = document.querySelectorAll('.editor_atto_wrap');
        if (attoEditor.length === 0) return;

        function getTextLengthInEl(el: HTMLElement): number {
            // 異体字セレクタを考慮して文字数をカウントする
            // ref: https://qiita.com/bon127/items/491b25e90208188dafbd#intlsegmenter
            return [...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(el.innerText ?? '')].length;
        }

        attoEditor.forEach((editor) => {
            const content = editor.querySelector<HTMLElement>('[contenteditable="true"]'); // contenteditableな要素を取得
            if (!content) return;
            const count = document.createElement('div');
            count.style.fontSize = 'small';
            count.style.color = '#666';
            count.style.textAlign = 'right';
            count.style.marginTop = '5px';
            count.style.marginBottom = '5px';
            count.textContent = `文字数: ${getTextLengthInEl(content)}`;
            editor.appendChild(count);

            content.addEventListener('input', () => {
                count.textContent = `文字数: ${getTextLengthInEl(content)}`;
            });
        });
    });
})();
