import './main.css';

export default defineContentScript({
    matches: ['*://www.omu.ac.jp/'],
    cssInjectionMode: 'manifest',
    main() {
        const banner = document.createElement('a');
        banner.classList.add('__moodle_plus__omub');
        banner.href = 'https://e.omu.ac.jp/';
        banner.innerText = '学内システムはこちら >';
        document.body.insertAdjacentElement('afterbegin', banner);
    },
});
