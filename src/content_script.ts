/// <reference path="types.d.ts" />

// グローバルスコープに変数を置きたくないので即時関数で囲む
(() => {
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
            const newsForumEl = document.getElementById("site-news-forum");

            if (!newsForumEl) {
                console.log("[Moodle Plus] News Feed is not found");
                return;
            }

            const title = newsForumEl.getElementsByTagName("h2")[0];
            if (title) {
                title.innerText = "サイトニュース (コンパクト版)";
            }
            const lastlink = newsForumEl.lastElementChild?.lastElementChild as HTMLAnchorElement;
            const subscribeButton = newsForumEl.getElementsByClassName("subscribelink")[0].children[0] as HTMLAnchorElement;
            subscribeButton.innerText = "長いお知らせ達を読む";
            subscribeButton.textContent = "長いお知らせ達を読む";
            subscribeButton.href = lastlink.href;
            const articles = newsForumEl.querySelectorAll("article.forum-post-container") as NodeListOf<HTMLDivElement>;
            // create new element
            const newNode = document.createElement("div");
            newNode.innerHTML = `<h6>☆お知らせ (タイトルのみ)</h6>`;
            if (articles.length > 0) {
                const newArticles: string[] = [];
                [...articles].forEach((article) => {
                    const title = (article.getElementsByClassName("h6 font-weight-bold mb-0")[0] as HTMLHeadingElement).innerText ?? null;
                    const link = (article.querySelector(".post-actions a[href*='forum/discuss.php']") as HTMLAnchorElement)?.href ?? null;
                    if (!title) return;
                    
                    if (!link) {
                        newArticles.push(title);
                    } else {
                        newArticles.push(`<a href="${link}">${title}</a>`);
                    }
                });

                newNode.innerHTML += '<ul>' + newArticles.map((el) => `<li>${el}</li>`).join('') + '</ul>';
            }
            newsForumEl.lastElementChild?.remove();
            // add element at lastElement of site-news-forum
            newsForumEl.appendChild(newNode);
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

    function dhms(ms: number) {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const daysms = ms % (24 * 60 * 60 * 1000);
        const hours = Math.floor((daysms) / (60 * 60 * 1000));
        const hoursms = ms % (60 * 60 * 1000);
        const minutes = Math.floor((hoursms) / (60 * 1000));
        const minutesms = ms % (60 * 1000);
        const sec = Math.floor((minutesms) / (1000));
        
        const res: string[] = [];
        res.push(hours.toString().padStart(2, '0'));
        res.push(minutes.toString().padStart(2, '0'));
        res.push(sec.toString().padStart(2, '0'));

        return (days ? `${days}日 ` : '') + res.join(":");
    }

    // eventId と 残り時間のKV
    const lefttime_list = new Map<number, number>();

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

            // 残り時間を表示
            lefttime_list.forEach((dueTime, eventId) => {
                const lefttime_span = document.querySelector(`.left_realtime_clock[data-moodle-plus-event-id="${eventId}"]`) as HTMLSpanElement;
                const remaining = dueTime - Date.now();
                let lefttime_time = dhms(remaining);
                if (remaining < 0) {
                    const elapsed = Math.abs(remaining);
                    lefttime_time = `⚠️期限切れ⚠️ -${dhms(elapsed)}`;
                    lefttime_span.style.color = "black";
                    lefttime_span.style.backgroundColor = "yellow";
                    lefttime_span.style.padding = "4px";
                    lefttime_span.style.borderRadius = "3px";
                    lefttime_span.style.margin = "5px";
                } else if (remaining < 1000 * 60 * 60 * 24) {
                    lefttime_span.style.color = "red";
                    lefttime_span.style.fontWeight = "bold";
                    lefttime_span.style.fontSize = "1.8em";
                }
                lefttime_span.innerText = lefttime_time;
                lefttime_span.textContent = lefttime_time;
            });

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
            newNode.innerHTML += `<div>※アンケートに答えてから表示される課題などはアンケートに答えるまで表示されません。</div>`;
            newNode.innerHTML += `<div>※「課題を確認する」ボタンになっている場合は、提出済みの場合に加え、<b>提出状況が不明の場合もあります。</b>提出期限前に、提出できているかを再確認するようにしてください。</div>`;
            newNode.innerHTML += `<div style="display:block;text-align:end;"><a href="/calendar/view.php?view=upcoming">もっと見る</a></div>`;

            // Tokenを取得
            // @ts-ignore
            const sessionKey: string | null = window.M?.cfg.sesskey ?? null;

            if (sessionKey === null) {
                console.error("[Moodle Plus] Failed to get session key");
                return;
            }

            // 期限の近い課題を取得
            const upcomingAssignmentsRes = await fetch(`https://${window.location.host}/lib/ajax/service.php?sesskey=${sessionKey}&info=core_calendar_get_calendar_upcoming_view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([{
                    index: 0,
                    methodname: 'core_calendar_get_calendar_upcoming_view',
                    args: {
                        courseid: '1',
                        categoryid: '0',
                    },
                }]),
            });

            if (!upcomingAssignmentsRes.ok) {
                console.error("[Moodle Plus] Failed to fetch upcoming assignments");
                return;
            }
        
            const upcomingAssignments = (await upcomingAssignmentsRes.json())[0] as {
                data: {
                    categoryid: number;
                    courseid: number;
                    date: Record<string, number | string>;
                    defaulteventcontext: number;
                    events: MoodleEvent[];
                    filter_selector: string;
                    isloggedin: boolean;
                };
                error: boolean;
            };

            let i: number = 0;
            const now = Date.now();
            const parsedAssignments = upcomingAssignments.data.events
                .filter((event) => !event.name.includes("可能期間の開始"))
                .map((event) => ({
                    eventId: event.id,
                    courseName: event.course.fullname,
                    assignmentTitle: event.activityname,
                    dueDate: (event.timestart + event.timeduration) * 1000,
                    url: event.url,
                    hasSubmitted: (event.action == null || event.action.name !== '課題を新規に提出する' || event.action.actionable === false),
                }))
                .sort((a, b) => a.dueDate - b.dueDate)
                .filter((event) => {
                    if (event.dueDate - now < 1000 * 60 * 60 * 30) {
                        // 30時間以内の場合は絶対残す
                        i++;
                        return true;
                    } else if (i < 4) {
                        // 4つまで表示
                        i++;
                        return true;
                    }
                    return false;
                });
            
            const htmledAssignments = parsedAssignments.map((assignment, i) => {
                const dueDate = new Date(assignment.dueDate);
                const dueDateString = `${dueDate.getMonth() + 1}月${dueDate.getDate()}日 ${dateToString(dueDate, false)}`;
                return `<div class="card my-2" ${!assignment.hasSubmitted && 'style="border: 4px solid #f0ad4e;"'}>
    <div class="card-body">
        <h6 class="card-subtitle" style="margin-top: 0;">${assignment.courseName}</h6>
        <h5 class="card-title">${assignment.assignmentTitle}</h5>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <h6 class="card-subtitle mb-2 text-muted">${dueDateString}<br/>残り時間>> <span class="left_realtime_clock" data-moodle-plus-event-id="${assignment.eventId}"></span></h6>
            <a href="${assignment.url}" class="btn btn-${assignment.hasSubmitted ? 'secondary' : 'warning'} num-${i}" style="height: fit-content; ${!assignment.hasSubmitted && 'font-weight: 700;'}">${assignment.hasSubmitted ? '課題を確認する' : '未提出'}</a>
        </div>
    </div>
</div>`;
            });

            parsedAssignments.forEach((assignment) => {
                lefttime_list.set(assignment.eventId, assignment.dueDate);
            });

            newNode.innerHTML += htmledAssignments.join('\n');

            document.getElementById("maincontent")?.parentElement?.insertBefore(newNode, document.getElementById("maincontent"));
            showTime();

        } catch (e) {
            console.log("[Moodle Plus] Failed to show upcoming assignments");
            console.log(e);
        }
    }
})();
