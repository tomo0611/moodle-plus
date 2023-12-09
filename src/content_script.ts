window.onload = function () {
    console.log("[Moodle Plus] content script script loaded");
    console.log("[Moodle Plus] UserStatus: logged in : " + isLoggedin());

    if (window.location.pathname === "/" && isLoggedin()) {
        changeTitle();
        minimizeNewsFeed();
    }
};

/**
 * 利用者がログインしているかどうかを返します。
 *
 * @return {boolean} ログインしているかどうか
 */
function isLoggedin() {
    return document.getElementsByClassName("usermenu")[0].children[0].className.indexOf("login") === -1;
}


/** メインページのタイトルを変更 */
function changeTitle() {
    try {
        let title;
        if (document.getElementsByClassName("page-header-headings").length === 0) {
            title = document.getElementById("page-header")?.getElementsByTagName("h2")[0];
        } else {
            title = document.getElementsByClassName("page-header-headings")[0].getElementsByTagName("h1")[0];
        }
        if (title) {
            title.innerHTML = "む～どるぷらす (Moodle Plus)";
        }
    } catch (e) {
        console.log("Title Format is not as expected");
        console.log(e);
    }
}

/** サイトニュースを最小化 */
function minimizeNewsFeed() {
    try {
        const newsFeeds = document.getElementById("site-news-forum")?.getElementsByClassName('d-flex body-content-container');
        if (newsFeeds) {
            for (let i = 0; i < newsFeeds.length; i++) {
                newsFeeds[i].innerHTML
                    = newsFeeds[i].getElementsByClassName("link text-right")[0].outerHTML;
            }
        }
    } catch (e) {
        console.log("News Feed Format is not as expected");
        console.log(e);
    }
}