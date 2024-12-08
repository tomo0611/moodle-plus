import type { MeaQsQuiz } from "@/types/moodle";

export function leaqsBackground() {
    chrome.runtime.onMessage.addListener((request) => {
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
            const tab = await chrome.tabs.create({ url: "leaqs.html" });
            const classAndSection = className + "/ " + sectionName;
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.sendMessage(tabId, {
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
