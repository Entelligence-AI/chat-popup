import {FC} from "react";
import {
    AssistantModal,
    AssistantModalPrimitive,
    ChatModelAdapter,
    useLocalRuntime,
    Thread,
    Composer,
    ThreadWelcome,
    type ThreadConfig,
} from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { makePrismAsyncSyntaxHighlighter } from "@assistant-ui/react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

import '../index.css';
import "@assistant-ui/react/styles/index.css";
import "@assistant-ui/react/styles/modal.css";
import {AnalyticsData} from "@/types";


type AppProps = {
   analyticsData: AnalyticsData;
}

export const App = ({ analyticsData }: AppProps) => {
    const { apiKey, repoName, organization, theme } = analyticsData;
    return (
        <div className={`${theme}`}>
            { apiKey && <DocsChat apiKey={apiKey} organization={organization} repoName={repoName}/>}
        </div>
    );
};

function asAsyncIterable<T>(source: ReadableStream<T>): AsyncIterable<T> {
    return {
        [Symbol.asyncIterator]: () => {
            const reader = source.getReader();
            return {
                async next(): Promise<IteratorResult<T, undefined>> {
                    const { done, value } = await reader.read();
                    return done
                        ? { done: true, value: undefined }
                        : { done: false, value };
                },
            };
        },
    };
}

const SyntaxHighlighter = makePrismAsyncSyntaxHighlighter({
    style: coldarkDark,
    customStyle: {
        margin: 0,
        backgroundColor: "black",
    },
});

const MarkdownText = makeMarkdownText({
    remarkPlugins: [remarkGfm],
    components: {
        SyntaxHighlighter,
    },
});

const MyCustomAdapter = ({ apiKey, repoName, organization }: AnalyticsData) => {
    const adapter = async function* ({ messages, abortSignal }) {
        const messagesToSend = messages.map((m) => ({
            role: m.role,
            content: m.content
                .filter((c) => c.type === "text")
                .map((c) => c.text)
                .join(" "),
        }));

        const response = await fetch("https://entelligence.ddbrief.com/repositoryAgent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                question: messagesToSend,
                history: [],
                vectorDBURL: `${organization}&${repoName}`,
            }),
            signal: abortSignal,
        });

        let text = "";
        for await (const chunk of asAsyncIterable(
            response.body!.pipeThrough(new TextDecoderStream()),
        )) {
            text += chunk;
            yield { content: [{ type: "text", text }] };
        }
    }

    return { adapter };
}

export const DocsChat = ({ repoName, organization, apiKey }: AnalyticsData) => {
    const { adapter } = MyCustomAdapter({ apiKey, repoName, organization });
    const runtime = useLocalRuntime(adapter);

    return (
        <MyAssistantModal
            runtime={runtime}
            welcome={{
                message: "Ask any question about assistant-ui",
            }}
            assistantMessage={{ components: { Text: MarkdownText } }}
        />
    );
};

const MyAssistantModal: FC<ThreadConfig> = (config) => {
    return (
        <AssistantModal.Root config={config}>
            <MyAssistantModalTrigger />
            <AssistantModal.Content className="h-[800px] w-[600px]">
                <MyThread />
            </AssistantModal.Content>
        </AssistantModal.Root>
    );
};

const MyAssistantModalTrigger: FC = () => {
    return (
        <AssistantModal.Anchor className="hidden md:block">
            <AssistantModalPrimitive.Trigger asChild>
                <AssistantModal.Button />
            </AssistantModalPrimitive.Trigger>
        </AssistantModal.Anchor>
    );
};

const MyThread: FC = () => {
    return (
        <Thread.Root className="flex flex-col">
            <Thread.Viewport>
                <ThreadWelcome />

                <Thread.Messages />

                <Thread.ViewportFooter className="pb-3">
                    <Thread.ScrollToBottom />
                    <Composer />
                </Thread.ViewportFooter>
            </Thread.Viewport>

            <a
                href="https://entelligence.ai"
                className="text-muted-foreground flex w-full items-center justify-center gap-2 border-t py-2 text-xs"
            >
                In partnership with{" "}
                <span className="flex items-center gap-2">
                     <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M4.89372 15.3343H15.6171V15.3343C15.7422 15.3343 15.7965 15.176 15.6977 15.0992L12.5532 12.6535M4.89372 15.3343V5.37696M4.89372 15.3343L2.5621 13.3358C2.34045 13.1458 2.21289 12.8712 2.21289 12.5793C2.21289 11.0961 2.21289 6.32709 2.21289 3.0791M4.89372 5.37696H15.6171M4.89372 5.37696L2.21289 3.0791M15.6171 5.37696V11.679C15.6171 12.2313 15.1693 12.679 14.6171 12.679H12.5532H8.66104C8.10875 12.679 7.66104 12.2313 7.66104 11.679V11.0195M15.6171 5.37696L13.2171 3.31984C13.0358 3.16449 12.8089 3.0791 12.5702 3.0791C11.137 3.0791 5.80917 3.0791 2.21289 3.0791"
                            stroke="#FFC635" stroke-width="1.2" stroke-linecap="round"/>
                        <circle cx="11.7874" cy="9.20663" r="0.5" fill="white" stroke="#FFC635" stroke-width="0.531905"/>
                        <path d="M1.06379 6.52548C1.4468 1.92987 1.06392 1.92869 6.80843 1.92939" stroke="#1D1D1D" stroke-linecap="round"/>
                    </svg>
                    Entelligence
                </span>
            </a>
        </Thread.Root>
    );
};
