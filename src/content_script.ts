window.onload = function () {
    console.log("[Moodle Plus] content script script loaded");
    console.log("[Moodle Plus] UserStatus: logged in : " + isLoggedin());

    if (window.location.pathname === "/" && isLoggedin()) {
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