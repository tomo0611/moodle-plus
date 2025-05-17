import type { MeaQsQuiz } from "@/types/moodle";

export function leaqsBackground() {
    browser.runtime.onMessage.addListener((request) => {
        if (request.action === "formatAndDisplayQuiz") {
            formatAndDisplayQuiz(
                request.quizData,
                request.className,
                request.sectionName
            );
        }
    });

    async function formatAndDisplayQuiz(
        quizData: MeaQsQuiz[],
        className: string,
        sectionName: string
    ) {
        try {
            const tab = await browser.tabs.create({ url: "leaqs.html" });
            const classAndSection = className + "/ " + sectionName;
            browser.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    browser.tabs.onUpdated.removeListener(listener);
                    browser.tabs.sendMessage(tabId, {
                        action: "displaySummary",
                        quizData: quizData,
                        classAndSection: classAndSection,
                    });
                }
            });
        } catch (error) {
            console.error("Error creating new tab:", error);
        }
    }
}
