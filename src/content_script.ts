// スクリプトが読み込まれた時の処理
console.log("[Moodle Plus] content script script loaded");
console.log("[Moodle Plus] UserStatus: logged in : " + isLoggedin());

if (window.location.pathname === "/" && isLoggedin()) {
    changeTitle();
    minimizeNewsFeed();
    showUpcomingAsignments();
}

/**
 * 利用者がログインしているかどうかを返します。
 *
 * @return {boolean} ログインしているかどうか
 */
function isLoggedin() {
    try {
        return document.getElementsByClassName("usermenu")[0].children[0].className.indexOf("login") === -1;
    } catch (e) {
        // 九州大学のログインページ対策
        return false;
    }
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
            const subtitle = document.createElement("p");
            subtitle.innerHTML = `Developed by <a href="https://tomo0611.jp/" target="_blank">tomo0611</a> (大阪公立大学 工学部 情報工)</br>
            バグなどの報告は<a href="https://github.com/tomo0611/moodle-plus" target="_blank">こちら</a>までお願いします。`;
            title.parentElement?.insertBefore(subtitle, title.nextElementSibling);
        }
    } catch (e) {
        console.log("[Moodle Plus] Title Format is not as expected");
        console.log(e);
    }
}

/** サイトニュースを最小化 */
function minimizeNewsFeed() {
    try {
        const title = document.getElementById("site-news-forum")?.getElementsByTagName("h2")[0];
        if (title) {
            title.innerText = "サイトニュース (コンパクト版)";
        }
        const lastlink = document.getElementById("site-news-forum")?.lastElementChild?.lastElementChild as HTMLAnchorElement;
        const subscribeButton = document.getElementById("site-news-forum")?.getElementsByClassName("subscribelink")[0].children[0] as HTMLAnchorElement;
        subscribeButton.innerText = "長いお知らせ達を読む";
        subscribeButton.textContent = "長いお知らせ達を読む";
        subscribeButton.href = lastlink.href;
        const titles = document.getElementById("site-news-forum")?.getElementsByClassName("h6 font-weight-bold mb-0");
        // create new element
        const newNode = document.createElement("div");
        newNode.innerHTML = `<h6>☆お知らせ (タイトルのみ)</h6>`;
        if (titles) {
            for (let i = 0; i < titles.length; i++) {
                const title = titles[i] as HTMLAnchorElement;
                newNode.innerHTML += title.innerText + "<br/>";
            }
        }
        document.getElementById("site-news-forum")?.lastElementChild?.remove();
        // add element at lastElement of site-news-forum
        document.getElementById("site-news-forum")?.appendChild(newNode);
    } catch (e) {
        console.log("[Moodle Plus] News Feed Format is not as expected");
        console.log(e);
    }
}


/**
 * Dateオブジェクトを表示用の文字列に変換します。
 *
 * @param {Date} date Dateオブジェクト
 * @param {boolean} [withDay=false] 日付を含めるかどうか
 * @return {string} 表示用の文字列
 */
function dateToString(date: Date, withDay: boolean = false): string {
    let h: number | string = date.getHours(); // 0 - 23
    let m: number | string = date.getMinutes(); // 0 - 59
    let s: number | string = date.getSeconds(); // 0 - 59
    const day = date.getDate() - 1;

    // 0埋め処理
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    let time = h + ":" + m + ":" + s;
    if (withDay && day !== 0) {
        time = day + "日 " + time;
    }
    return time;
}

// 提出期限(unixtime)をまとめた配列
const lefttime_list: number[] = [];

/**
 * 残り時間を表示します。
 */
function showTime() {
    try {
        // 現在時刻を表示
        let date = new Date();
        let time = dateToString(date, false);
        const realtime_clock = document.getElementById("realtime_clock");
        if (realtime_clock) {
            realtime_clock.innerText = time;
            realtime_clock.textContent = time;
        }


        for (let i = 0; i < lefttime_list.length; i++) {
            const lefttime = lefttime_list[i];
            const lefttime_span = document.getElementsByClassName("left_realtime_clock")[i] as HTMLSpanElement;
            const lefttime_date = new Date(lefttime * 1000 - date.getTime() - 1000 * 3600 * 9);
            let lefttime_time = dateToString(lefttime_date, true);
            if (lefttime_date.getDate() - 1 === 0) {
                lefttime_span.style.color = "red";
                lefttime_span.style.fontWeight = "bold";
                lefttime_span.style.fontSize = "1.8em";
            }
            lefttime_span.innerText = lefttime_time;
            lefttime_span.textContent = lefttime_time;
        }

        // 1秒後にまた実行
        setTimeout(showTime, 1000);
    } catch (e) {
        console.log("[Moodle Plus] Failed to show time");
        console.log(e);
    }
}

/** 期限の近い課題を表示 */
async function showUpcomingAsignments() {
    try {
        const newNode = document.createElement("span");
        newNode.innerHTML = `<h3>☆そろそろ提出せなあかん課題</h3>`;
        newNode.innerHTML += `<p>現在の時刻：<span id="realtime_clock"></span> (※注意:ズレがある場合があります)</p>`;
        newNode.innerHTML += `※アンケートに答えてから表示される課題などはアンケートに答えるまで表示されません。`;
        newNode.innerHTML += `<div style="display:block;text-align:end;"><a href="/calendar/view.php?view=upcoming">もっと見る</a></div>`;

        // 期限の近い課題を取得
        const upcoming_data = await (await fetch(`https://${window.location.host}/calendar/view.php?view=upcoming`)).text();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(upcoming_data, 'text/html');
        // 課題一覧
        const events = htmlDoc.getElementsByClassName('eventlist my-1')[0].getElementsByClassName("event mt-3");
        // 最大4件に絞る
        const length = events.length > 4 ? 4 : events.length;
        for (let i = 0; i < length; i++) {
            const event = events[i];
            const event_title = (event.getElementsByClassName('name d-inline-block')[0] as HTMLHeadingElement).innerText;

            // 期間の開始を除外
            if (event_title.indexOf("可能期間の開始") !== -1) continue;

            const cardBody = event.getElementsByClassName('description card-body')[0];
            const event_unixtime = parseInt(cardBody.getElementsByClassName('col-11')[0].getElementsByTagName("a")[0].href.split("&time=")[1]);
            lefttime_list.push(event_unixtime);
            const event_date = (cardBody.getElementsByClassName('col-11')[0] as HTMLAnchorElement).innerText;
            let event_url = (event.getElementsByClassName('card-link')[0] as HTMLAnchorElement).href;
            if (event_url.indexOf("&action=") !== -1) {
                event_url = event_url.split("&action=")[0];
            }
            const event_course = (event.getElementsByClassName('col-11')[event.getElementsByClassName('col-11').length - 1] as HTMLAnchorElement).innerText;
            newNode.innerHTML += `
        <div class="card my-2">
            <div class="card-body">
                <h6 class="card-subtitle">${event_course}</h6>
                <h5 class="card-title">${event_title}</h5>
                <div style="display: flex; justify-content: space-between;">
                
                    <h6 class="card-subtitle mb-2 text-muted">${event_date}<br/>残り時間>> <span class="left_realtime_clock"></span></h6>
                    <a href="${event_url}" class="btn btn-primary" style="height: fit-content;">課題を確認する</a>
                </div>
            </div>
        </div>
        `;
        }
        document.getElementById("maincontent")?.parentElement?.insertBefore(newNode, document.getElementById("maincontent"));

        showTime();
    } catch (e) {
        console.log("[Moodle Plus] Failed to show upcoming assignments");
        console.log(e);
    }
}