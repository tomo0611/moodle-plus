import { compatibleWebsiteHostnames } from '@/const';
import type { MeaQsQuiz } from '@/types/moodle';

export default defineContentScript({
    matches: compatibleWebsiteHostnames.map((hostname) => `*://${hostname}/mod/meaqs/student/appraisals.php*`),
    main() {
        createLeaQsPDFButton();

        function createLeaQsPDFButton() {
            const pdfButton = document.getElementById("pdf_button");
            if (!pdfButton) return;

            const parentDiv = pdfButton?.parentNode;
            if (!parentDiv) return;

            const button = document.createElement("button");
            button.className = "btn btn-info";
            button.textContent = "leaQs";
            button.style.padding = "9px 18px";
            button.style.backgroundColor = "#327ab7";
            button.style.color = "#fff";
            button.style.border = "none";
            button.style.cursor = "pointer";

            const spacer = document.createTextNode(" ");

            try {
                parentDiv.insertBefore(button, pdfButton.nextSibling);
                parentDiv.insertBefore(spacer, pdfButton.nextSibling);
            } catch (e) {
                console.error("Error inserting button:", e);
                return;
            }

            button.addEventListener("click", () => {
                try {
                    const quizData = extractQuizElements();
                    const pageNavbar = document.querySelector("#page-navbar");
                    const className = pageNavbar?.querySelector("a")?.title ?? "";
                    const sectionName =
                        pageNavbar?.querySelector("span")?.textContent ?? "";
                    chrome.runtime.sendMessage({
                        action: "formatAndDisplayQuiz",
                        quizData: quizData,
                        className: className,
                        sectionName: sectionName,
                    });
                } catch (error) {
                    console.error("Runtime error:", error);
                }
            });
        }

        function extractQuizElements() {
            const quizzes: MeaQsQuiz[] = [];
            const quizContainers = document.querySelectorAll(
                ".fcontainer.clearfix"
            );

            quizContainers.forEach((container, index) => {
                const quiz: MeaQsQuiz = {
                    index: index,
                    question: [],
                };
                // 質問の抽出
                const questionNodes =
                    container.querySelector(".form-control-static .text_to_html")
                        ?.childNodes ?? [];
                if (questionNodes.length >= 0) {
                    for (let i = 0; i < questionNodes.length; i += 1) {
                        const questionNode = questionNodes[i]?.textContent?.replace(
                            /\s+/g,
                            ""
                        );
                        if (questionNode !== undefined) {
                            quiz.question.push(questionNode);
                        }
                    }
                }

                // 選択肢の抽出
                const choiceElements =
                    container.querySelectorAll(".radio").length !== 0
                        ? container.querySelectorAll(".radio")
                        : container.querySelectorAll(".checkbox");
                quiz.choices = [];
                if (choiceElements) {
                    for (let i = 0; i < choiceElements.length; i += 1) {
                        const choices = choiceElements[i];
                        const choiceChilds = choices.childNodes;
                        const text = [];
                        for (let j = 0; j < choiceChilds.length; j += 1) {
                            const textChild = choiceChilds[j];
                            if (textChild.nodeType === 1) {
                                const textNode = (
                                    textChild as Element
                                ).getElementsByTagName("p");
                                if (textNode.length !== 0) {
                                    for (let k = 0; k < textNode.length; k += 1) {
                                        text.push(textNode[k].textContent);
                                    }
                                } else {
                                    const textToHtmlElement = (
                                        textChild as Element
                                    )?.querySelector(
                                        ".text_to_html"
                                    ) as Element | null;
                                    if (textToHtmlElement) {
                                        const textContent =
                                            textToHtmlElement?.textContent;
                                        if (textContent) {
                                            text.push(textContent);
                                        }
                                    } else {
                                        const textContent = textChild.textContent;
                                        if (textContent) {
                                            text.push(textContent);
                                        }
                                    }
                                }
                            }
                        }
                        quiz.choices.push(text);

                        // 選択肢問題の正答を取得
                        if (choices.querySelector("strong .text_to_html")) {
                            const correct = choices.querySelector("strong");
                            const correctChilds = correct ? correct.childNodes : [];
                            const text = [];
                            for (let j = 0; j < correctChilds.length; j += 1) {
                                const textChild = correctChilds[j];
                                if (textChild.nodeType === 1) {
                                    const textNode = (
                                        textChild as Element
                                    ).getElementsByTagName("p");
                                    if (textNode.length !== 0) {
                                        for (
                                            let k = 0;
                                            k < textNode.length;
                                            k += 1
                                        ) {
                                            text.push(textNode[k].textContent);
                                        }
                                    } else {
                                        const textToHtmlElement = (
                                            textChild as Element
                                        )?.querySelector(
                                            ".text_to_html"
                                        ) as Element | null;
                                        if (textToHtmlElement) {
                                            const textContent =
                                                textToHtmlElement?.textContent;
                                            if (textContent) {
                                                text.push(textContent);
                                            }
                                        } else {
                                            const textContent =
                                                textChild.textContent;
                                            if (textContent) {
                                                text.push(textContent);
                                            }
                                        }
                                    }
                                }
                            }
                            quiz.correct = text.filter(
                                (value) => value !== null
                            ) as string[];
                        }
                    }
                }

                // 選択肢問題の解答を取得
                if (
                    container.querySelector(
                        ".answer-correct .form-control-static"
                    ) ||
                    container.querySelector(
                        ".answer-incorrect .form-control-static"
                    )
                ) {
                    const answerElement =
                        container.querySelector(
                            ".answer-correct .form-control-static"
                        ) ||
                        container.querySelector(
                            ".answer-incorrect .form-control-static"
                        );
                    const answerChilds = answerElement?.childNodes ?? [];
                    const text = [];
                    for (let j = 0; j < answerChilds.length; j += 1) {
                        const textChild = answerChilds[j];
                        if (textChild.nodeType === 1) {
                            const textNode = (
                                textChild as Element
                            ).getElementsByTagName("p");
                            if (textNode.length !== 0) {
                                for (let k = 0; k < textNode.length; k += 1) {
                                    text.push(textNode[k].textContent);
                                }
                            } else {
                                const textToHtmlElement = (
                                    textChild as Element
                                )?.querySelector(".text_to_html") as Element | null;
                                if (textToHtmlElement) {
                                    const textContent =
                                        textToHtmlElement?.textContent;
                                    if (textContent) {
                                        text.push(textContent);
                                    }
                                } else {
                                    const textContent = textChild.textContent;
                                    if (textContent) {
                                        text.push(textContent);
                                    }
                                }
                            }
                        }
                    }
                    quiz.answer = text.filter(
                        (value) => value !== null
                    ) as string[];
                }

                // 画像の抽出
                const imageElement = container.querySelectorAll("img");
                if (imageElement.length !== 0) {
                    quiz.image = [];
                    imageElement.forEach((image) => {
                        const src = image.src;
                        //@ts-ignore quiz.imageは-3行部分で初期化しているため、undefinedではない
                        quiz.image.push(src);
                    });
                }

                // 記述問題の解答例と回答の抽出
                if (quiz.choices.length === 0) {
                    const answerElements = container.querySelectorAll(
                        ".form-control-static .text_to_html"
                    );
                    if (answerElements[1]) {
                        const correctChilds = answerElements[1].childNodes;
                        const text = [];
                        for (let j = 0; j < correctChilds.length; j += 1) {
                            const textChild = correctChilds[j];
                            if (textChild.nodeType === 1) {
                                const textNode = (
                                    textChild as Element
                                ).querySelectorAll("p");
                                if (textNode.length !== 0) {
                                    for (let k = 0; k < textNode.length; k += 1) {
                                        text.push(textNode[k].textContent);
                                    }
                                } else {
                                    const textToHtmlElement = (
                                        textChild as Element
                                    )?.querySelector(
                                        ".text_to_html"
                                    ) as Element | null;
                                    if (textToHtmlElement) {
                                        const textContent =
                                            textToHtmlElement?.textContent;
                                        if (textContent) {
                                            text.push(textContent);
                                        }
                                    } else {
                                        const textContent = textChild.textContent;
                                        if (textContent) {
                                            text.push(textContent);
                                        }
                                    }
                                }
                            }
                        }
                        quiz.correct = text.filter(
                            (value) => value !== null
                        ) as string[];
                    }
                    if (answerElements[2]) {
                        const answerChilds = answerElements[2].childNodes;
                        const text = [];
                        for (let j = 0; j < answerChilds.length; j += 1) {
                            const textChild = answerChilds[j];
                            if (textChild.nodeType === 1) {
                                const textNode = (
                                    textChild as Element
                                ).querySelectorAll("p");
                                if (textNode.length !== 0) {
                                    for (let k = 0; k < textNode.length; k += 1) {
                                        text.push(textNode[k].textContent);
                                    }
                                } else {
                                    const textToHtmlElement = (
                                        textChild as Element
                                    )?.querySelector(
                                        ".text_to_html"
                                    ) as Element | null;
                                    if (textToHtmlElement) {
                                        const textContent =
                                            textToHtmlElement?.textContent;
                                        if (textContent) {
                                            text.push(textContent);
                                        }
                                    } else {
                                        const textContent = textChild.textContent;
                                        if (textContent) {
                                            text.push(textContent);
                                        }
                                    }
                                }
                            }
                        }
                        quiz.answer = text.filter(
                            (value) => value !== null
                        ) as string[];
                    }
                }

                // If either quiz.correct or quiz.answer is null, the other must be also null.
                if (quiz.correct === undefined || quiz.answer === undefined) {
                    quiz.correct = undefined;
                    quiz.answer = undefined;
                }

                quizzes.push(quiz);
            });

            return quizzes;
        }
    }
});
