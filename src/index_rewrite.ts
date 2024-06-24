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

    /**
     * ミリ秒を日:時:分:秒の形式の文字列に変換します。
     * @param ms - ミリ秒
     * @returns 日:時:分:秒の形式の文字列（日はある場合のみ）
     */
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

    // instanceId と 残り時間のKV
    const lefttime_list = new Map<number, number>();

    // timer
    let showTimeTimer: number | null = null;

    /**
     * 残り時間を表示します。
     */
    function showTime() {
        if (showTimeTimer) {
            clearTimeout(showTimeTimer);
            showTimeTimer = null;
        }

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
                const lefttime_span = document.querySelector<HTMLSpanElement>(`.left_realtime_clock[data-moodle-plus-event-id="${eventId}"]`);
                if (!lefttime_span) return;
                const remaining = dueTime - Date.now();
                let lefttime_time = dhms(remaining);
                if (remaining < 0) {
                    const elapsed = Math.abs(remaining);
                    lefttime_time = `⚠️期限切れ⚠️ -${dhms(elapsed)}`;
                    lefttime_span.style.display = "inline-block";
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
            showTimeTimer = setTimeout(showTime, 1000);
        } catch (e) {
            console.log("[Moodle Plus] Failed to show time");
            console.log(e);
        }
    }

    /** 期限の近い課題を表示 */
    async function showUpcomingAsignments() {
        try {
            const newNode = document.createElement("div");
            newNode.innerHTML = `<h3>☆そろそろ提出せなあかん課題</h3>`;
            newNode.innerHTML += `<p>現在の時刻：<span id="realtime_clock"></span> (※注意:ズレがある場合があります)</p>`;
            newNode.innerHTML += `※アンケートに答えてから表示される課題などはアンケートに答えるまで表示されません。`;
            newNode.innerHTML += `<div style="display:block;text-align:end;"><a href="/calendar/view.php?view=upcoming">詳しく見る</a></div>`;
            newNode.innerHTML += '<div id="moodle_plus_upcoming_assignments_fetch_error" class="alert alert-danger d-none my-3"><span></span></div>';
            newNode.innerHTML += `<div id="upcoming_assignments">
    <div class="card my-2 py-6 text-center" id="hide_on_load">
        <div>
            <div class="d-inline-block spinner-border spinner-border-sm" role="status">
                <span class="sr-only">Loading...</span>
            </div><br/>
            読み込み中…
        </div>
    </div>
</div>`;
            const actionsButtonWrapper = document.createElement("div");
            actionsButtonWrapper.classList.add("text-right", "my-2");
            const actionsButtonGroup = document.createElement("div");
            actionsButtonGroup.classList.add("btn-group");

            const reloadButton = document.createElement("button");
            reloadButton.className = "btn btn-sm btn-outline-secondary";
            reloadButton.innerText = "提出状況を再確認";
            reloadButton.disabled = true;
            reloadButton.addEventListener("click", async () => {
                reloadButton.disabled = true;
                fetchMoreButton.disabled = true;
                await reload();
                reloadButton.disabled = false;
                fetchMoreButton.disabled = false;
            });

            const fetchMoreButton = document.createElement("button");
            fetchMoreButton.className = "btn btn-sm btn-outline-secondary";
            fetchMoreButton.innerText = "もっと見る";
            fetchMoreButton.disabled = true;
            fetchMoreButton.addEventListener("click", async () => {
                fetchMoreButton.disabled = true;
                reloadButton.disabled = true;
                await fetchMore();
                if (limitedAssignments.length >= parsedAssignments.length) {
                    fetchMoreButton.remove();
                } else {
                    fetchMoreButton.disabled = false;
                }
                reloadButton.disabled = false;
            });

            actionsButtonGroup.appendChild(reloadButton);
            actionsButtonGroup.appendChild(fetchMoreButton);
            actionsButtonWrapper.appendChild(actionsButtonGroup);
            newNode.appendChild(actionsButtonWrapper);

            document.getElementById("maincontent")?.parentElement?.insertBefore(newNode, document.getElementById("maincontent"));

            function toggleError(message?: string, withReloadButton = true) {
                const errorEl = document.getElementById("moodle_plus_upcoming_assignments_fetch_error");
                if (!errorEl) return;
                const errorElText = errorEl.getElementsByTagName("span")[0];

                const reloadButton = document.createElement("a");
                reloadButton.href = "#";
                reloadButton.innerText = "再読み込み";
                reloadButton.addEventListener("click", (ev) => {
                    ev.preventDefault();
                    location.reload();
                });

                if (message != null) {
                    errorElText.innerText = message;
                    if (withReloadButton) {
                        errorEl.appendChild(reloadButton);
                    }
                    errorEl.classList.remove("d-none");
                } else {
                    errorElText.innerText = "";
                    if (errorEl.contains(reloadButton)) {
                        errorEl.removeChild(reloadButton);
                    }
                    errorEl.classList.add("d-none");
                }
            }

            // Tokenを取得
            // @ts-ignore
            const sessionKey: string | null = window.M?.cfg.sesskey ?? null;

            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const timesortfrom = Math.floor(now.valueOf() / 1000) - 60 * 60 * 24 * 1; // 1日前から
            const timesortto = Math.floor(now.valueOf() / 1000) + 60 * 60 * 24 * 7;

            if (sessionKey === null) {
                console.error("[Moodle Plus] Failed to get session key");
                toggleError("セッションキーの取得に失敗しました。Moodle PlusがこのMoodleには対応していない可能性があります。ページを再読み込みしても改善しない場合はMoodle Plusへのバグ報告をお願いします。");
                return;
            }

            /**
             * 期限の近い課題を取得
             * 
             * - `core_calendar_get_action_events_by_timesort` では提出済みの課題が表示されない
             * - `core_calendar_get_calendar_upcoming_view` では期限切れの課題が表示されない
             * 
             * ので両方fetch
             */
            const upcomingAssignmentsRes = await fetch(`https://${window.location.host}/lib/ajax/service.php?sesskey=${sessionKey}&info=core_calendar_get_action_events_by_timesort,core_calendar_get_calendar_upcoming_view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([{
                    index: 0,
                    methodname: 'core_calendar_get_action_events_by_timesort',
                    args: {
                        timesortfrom,
                        timesortto, // 30日後まで
                        limitnum: 10,
                    },
                }, {
                    index: 1,
                    methodname: 'core_calendar_get_calendar_upcoming_view',
                    args: {
                        courseid: '1',
                        categoryid: '0',
                    },
                }]),
            });

            if (!upcomingAssignmentsRes.ok) {
                console.error("[Moodle Plus] Failed to fetch upcoming assignments");
                toggleError("課題の取得に失敗しました。Moodleからログアウトしている可能性があります。ページを再読み込みしてみてください。");
                return;
            }

            // 生のデータ（JSON）
            const upcomingAssignments = (await upcomingAssignmentsRes.json()) as [
                GetActionEventsByTimesortRes,
                GetCalendarUpcomingViewRes,
            ];

            // 重複を除去して統合
            const mergedAssignments = Array.from(new Map(upcomingAssignments.flatMap((res) => res.data.events.map((event) => [event.id, event]))).values());

            // 生データを整形
            const parsedAssignments: ParsedAssignments[] = mergedAssignments
                .filter((event) => event.normalisedeventtype === 'course') // 授業イベント以外を除外
                .reduce((acc: ParsedAssignments[], event: MoodleEvent) => { // 開始と終了のイベントを結合して、ついでにデータを成形する

                    // ここでは簡易判定。確実に提出してない場合だけをfalseにする
                    function getHasSubmitted(action: MoodleAction | undefined): boolean {
                        if (action != null && ['課題を新規に提出する', '問題を受験する'].includes(action.name) && action.actionable) {
                            return false; // 絶対提出できてないやつ
                        }
                        return true; // それ以外
                    }

                    if (event.eventtype === 'open') {
                        const existingEventIndex = acc.findIndex((e) => e.instanceId === event.instance);
                        if (existingEventIndex !== -1) {
                            acc[existingEventIndex] = {
                                ...acc[existingEventIndex],
                                startDate: event.timestart * 1000,
                            };
                        } else {
                            acc.push({
                                eventId: event.id,
                                instanceId: event.instance,
                                courseName: event.course.fullname,
                                assignmentTitle: event.activityname,
                                moduleName: event.modulename,
                                startDate: event.timestart * 1000,
                                dueDate: (event.timestart + event.timeduration) * 1000,
                                url: event.url,
                                actionAvailable: event.action != null ? event.action.actionable : undefined,
                                hasSubmitted: getHasSubmitted(event.action),
                            });
                        }
                    } else {
                        const existingEventIndex = acc.findIndex((e) => e.instanceId === event.instance);
                        if (existingEventIndex !== -1) {
                            acc[existingEventIndex] = {
                                ...acc[existingEventIndex],
                                dueDate: (event.timestart + event.timeduration) * 1000,
                            };
                        } else {
                            acc.push({
                                eventId: event.id,
                                instanceId: event.instance,
                                courseName: event.course.fullname,
                                assignmentTitle: event.activityname,
                                moduleName: event.modulename,
                                startDate: event.timeduration > 0 ? event.timestart * 1000 : undefined,
                                dueDate: (event.timestart + event.timeduration) * 1000,
                                url: event.url,
                                actionAvailable: event.action != null ? event.action.actionable : undefined,
                                hasSubmitted: getHasSubmitted(event.action),
                            });
                        }
                    }
                    return acc;
                }, [])
                .filter((event) => event.dueDate > Date.now() || !event.hasSubmitted) // 期限切れの提出済み課題を除外
                .sort((a, b) => a.dueDate - b.dueDate); // 期限が近い順にソート

            //#region 描画用の関数定義群
            /**
             * 課題の表示数を制限する
             * @param assignments 課題データ
             * @param limit 表示する個数の上限（デフォルト: 4）
             */
            function limitAssignments(assignments: ParsedAssignments[], limit: number = 4) {
                let i: number = 0;

                return assignments.filter((event) => { // 掲載する個数制限
                    if (event.dueDate - Date.now() < 1000 * 60 * 60 * 30) {
                        // 30時間以内の場合は絶対残す
                        i++;
                        return true;
                    } else if (i < limit) {
                        // limit個まで表示
                        i++;
                        return true;
                    }
                    return false;
                });
            }

            /**
             * カードを生成して表示する関数
             * @param assignments 課題データ
             * @param isPartial 提出状況が不明なものを「読み込み中」として表示するか？
             */
            function renderAssignmentsCard(assignments: ParsedAssignments[], isPartial: boolean = false) {
                // 整形したデータからHTMLを生成
                const htmledAssignments = assignments.map((assignment, i) => {
                    const dueDate = new Date(assignment.dueDate);
                    let dueDateString = `${dueDate.getMonth() + 1}月${dueDate.getDate()}日 ${dateToString(dueDate, false)}`;
                    const hasNotStarted = assignment.startDate != null && assignment.startDate > Date.now();
                    const hasNotSubmitted = (!hasNotStarted || assignment.actionAvailable === false) && assignment.hasSubmitted === false;
                    const startDateInstance = assignment.startDate ? new Date(assignment.startDate) : null;
                    if (startDateInstance) {
                        const startDateString = `${startDateInstance.getMonth() + 1}月${startDateInstance.getDate()}日 ${dateToString(startDateInstance, false)}`;
                        dueDateString += ` (${startDateString} 開始)`;
                    }

                    const buttonText = (() => {
                        if (assignment.hasSubmitted === 'unknown') {
                            return '提出状況不明';
                        } else if (hasNotStarted) {
                            return '開始前';
                        } else if (assignment.actionAvailable === false) {
                            return 'まだ提出できないかも';
                        } else if (assignment.hasSubmitted === true) {
                            if (isPartial) {
                                return '<div class="d-inline-block spinner-border spinner-border-sm mr-1" role="status"><span class="sr-only">Loading...</span></div>提出状況を確認中';
                            } else {
                                return '提出済み';
                            }
                        } else {
                            return '課題を確認する';
                        }
                    })();

                    return `<div class="card my-2" ${hasNotSubmitted && 'style="border-color: #f0ad4e; box-shadow: inset 0 0 0 3px #f0ad4e;"'}>
    <div class="card-body">
        <h6 class="card-subtitle" style="margin-top: 0;">${assignment.courseName}</h6>
        <h5 class="card-title">${assignment.assignmentTitle}</h5>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <h6 class="card-subtitle mb-2 text-muted">${dueDateString}<br/>残り時間>> <span class="left_realtime_clock" data-moodle-plus-event-id="${assignment.eventId}"></span></h6>
            <a href="${assignment.url}" class="btn btn-${hasNotSubmitted ? 'primary' : 'secondary'} num-${i}" style="display: flex; align-items: center; ${(hasNotSubmitted) && 'font-weight: 700;'}">${buttonText}</a>
        </div>
    </div>
</div>`;
                });
                document.getElementById("hide_on_load")?.remove();
                document.getElementById('upcoming_assignments')!.innerHTML = htmledAssignments.join('\n');

                // 残り時間を表示するためのデータをセット
                assignments.forEach((assignment) => {
                    lefttime_list.set(assignment.eventId, assignment.dueDate);
                });

                showTime();
            }

            /**
             * HTMLから提出状況を判定
             * @param html HTML文字列
             * @param instanceId インスタンスID（モジュールのID）
             */
            function determineStatusByHtml(html: string, instanceId: number) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    // 課題・テストの提出状況
                    const assignmentState = (doc.getElementsByClassName("submissionstatussubmitted cell c1 lastcol").length > 0) ? true : false;
                    // 複数回受験可能なテストの提出状況
                    const quizState = (doc.querySelectorAll(".quizattemptsummary tbody>tr").length > 0) ? true : false;
                    // アンケートの提出状況
                    const questionnaireState = (doc.getElementsByClassName("yourresponse").length > 0) ? true : false;

                    console.log(`[Moodle Plus] Submission Status for ${instanceId}: `, { assignmentState, questionnaireState });

                    return assignmentState || quizState || questionnaireState;
                } catch (e) {
                    console.log("[Moodle Plus] Failed to determine submission status by HTML");
                    return 'unknown';
                }
            }

            /**
             * 各課題ページにアクセスして提出状況を取得（Promise.allで同時並行で取得して高速化を図る）
             * @param assignments 課題データ
             * @param instanceIds 提出状況を更新したいインスタンスID（モジュールのID）のリスト
             */
            async function fetchSubmissionStatuses(assignments: ParsedAssignments[], instanceIds?: number[]) {
                type SubmissionStatus = { instanceId: number, hasSubmitted: boolean | 'unknown' };

                const submissionStatuses: SubmissionStatus[] = await Promise.allSettled(assignments
                    .filter((assignment) => {
                        if (instanceIds != null && !instanceIds.includes(assignment.instanceId)) {
                            return false;
                        }
                        return assignment.startDate == null || assignment.startDate < Date.now();// 未開始の課題はスキップ
                    })
                    .map(async (assignment) => {
                        if (assignment.moduleName === 'feedback') {
                            // フィードバックの場合は、提出できたかどうかがわからないことがあるので不明として扱う
                            return { instanceId: assignment.instanceId, hasSubmitted: 'unknown' };
                        }
                        const res = await fetch(assignment.url);
                        const html = await res.text();
                        return { instanceId: assignment.instanceId, hasSubmitted: determineStatusByHtml(html, assignment.instanceId) };
                    })
                ).then((results) => {
                    if (results.some((result) => result.status === 'rejected')) {
                        toggleError("提出状況の詳細の取得に失敗した課題があります。Moodleを再読み込みしてみてください。それでも改善しない場合はMoodle Plusにバグ報告をお願いします。");
                    }

                    return results
                        .filter((result) => result.status === 'fulfilled')
                        .map((result) => (result as PromiseFulfilledResult<SubmissionStatus>).value)
                });

                // 提出状況を更新
                const updatedAssignments = assignments.map((assignment) => {
                    const submissionStatus = submissionStatuses.find((status) => status.instanceId === assignment.instanceId);
                    return { ...assignment, hasSubmitted: (submissionStatus?.hasSubmitted != null) ? submissionStatus.hasSubmitted : assignment.hasSubmitted };
                });
                renderAssignmentsCard(updatedAssignments);
            }

            /** 「もっと見る」ボタンの実装 */
            async function fetchMore() {
                let instanceIds = limitedAssignments.map((assignment) => assignment.instanceId);
                limitedAssignments = limitAssignments(parsedAssignments, limitedAssignments.length + 4);
                instanceIds = limitedAssignments.map((assignment) => assignment.instanceId).filter((id) => !instanceIds.includes(id));
                console.log("[Moodle Plus] Fetch more assignments: ", limitedAssignments);
                toggleError();
                renderAssignmentsCard(limitedAssignments, true);
                await fetchSubmissionStatuses(limitedAssignments, instanceIds);
            }

            /** 「提出状況を更新」ボタンの実装 */
            async function reload() {
                toggleError();
                renderAssignmentsCard(limitedAssignments, true);
                await fetchSubmissionStatuses(limitedAssignments);
            }
            //#endregion

            //#region 初回描画処理
            let limitedAssignments = limitAssignments(parsedAssignments);
            console.log("[Moodle Plus] Upcoming Assignments: ", limitedAssignments);

            // いったん仮データで表示してしまう（正確な提出状況データの取得には時間がかかるため）
            renderAssignmentsCard(limitedAssignments, true);

            fetchSubmissionStatuses(limitedAssignments).then(() => {
                reloadButton.disabled = false;
                fetchMoreButton.disabled = false;
            });
            //#endregion
        } catch (e) {
            console.log("[Moodle Plus] Failed to show upcoming assignments");
            console.log(e);
        }
    }
})();
