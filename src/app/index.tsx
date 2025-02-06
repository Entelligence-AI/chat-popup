import {FC, useEffect, useState} from "react";
import {
    AssistantModal,
    AssistantModalPrimitive,
    ChatModelAdapter,
    useLocalRuntime,
    Thread,
    Composer,
    ThreadWelcome,
    type ThreadConfig,
	useThreadContext,
} from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { makePrismAsyncSyntaxHighlighter } from "@assistant-ui/react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

import "@assistant-ui/react-markdown/styles/tailwindcss/markdown.css";
import "@assistant-ui/react/styles/index.css";
import "@assistant-ui/react/styles/modal.css";

import {AnalyticsData} from "@/types";
import {usePostHog} from "posthog-js/react";


export const App = ({ apiKey, repoName, organization }: AnalyticsData) => {
    const posthog = usePostHog();
	const [numQuestions, setNumQuestions] = useState(0);

    useEffect(() => {
        posthog?.capture('chat_initialized', {
            apiKey,
            repoName,
            organization
        })
    }, [apiKey, repoName, organization]);

    return (
        <div>
            { apiKey && <DocsChat apiKey={apiKey} organization={organization} repoName={repoName} numQuestions={numQuestions} setNumQuestions={setNumQuestions}/>}
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

const MyCustomAdapter = ({ apiKey, repoName, organization, numQuestions, setNumQuestions }: AnalyticsData) => {
    return {
        async* run({messages, abortSignal}: { messages: any, abortSignal: AbortSignal}) {
            const { content: question, role } = messages.pop()!;
            if (role !== "user" || !question) throw new Error("No question provided");
			
			if (setNumQuestions) setNumQuestions((numQuestions) => numQuestions + 1);

            const response = await fetch("https://entelligence.ddbrief.com/repositoryAgent/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    question: question[0]?.text,
                    history: [],
                    vectorDBUrl: `${organization}&${repoName}`,
                    enableArtifacts: false,
                    advancedAgent: false,
                    limitSources: 3          
                }),
                signal: abortSignal,
            });

            let text = "";
            for await (const chunk of asAsyncIterable<any>(
                response.body!.pipeThrough(new TextDecoderStream()),
            )) {
                text += chunk;
                yield {content: [{type: "text", text}]};
            }
        },
    }
}

export const DocsChat = ({ repoName, organization, apiKey, setNumQuestions, numQuestions }: AnalyticsData) => {
    const adapter = MyCustomAdapter({ apiKey, repoName, organization, numQuestions, setNumQuestions });
    const runtime = useLocalRuntime(adapter as ChatModelAdapter);

    return (
        <MyAssistantModal
            runtime={runtime}
            welcome={{
                message: `Ask any question about ${repoName}`,
            }}
            assistantMessage={{ components: { Text: MarkdownText } }}
            organization={organization}
            repoName={repoName}
            apiKey={apiKey}
			numQuestions={numQuestions}
			setNumQuestions={setNumQuestions}
        />
    );
};

const MyAssistantModal: FC<ThreadConfig&AnalyticsData> = (config) => {
    return (
        <AssistantModal.Root config={config} >
            <MyAssistantModalTrigger
                apiKey={config.apiKey}
                repoName={config.repoName}
                organization={config.organization}
				numQuestions={config.numQuestions}
				setNumQuestions={config.setNumQuestions}
            />
            <AssistantModal.Content style={{width: '600px', height: '620px'}}>
                <MyThread numQuestions={config.numQuestions} vectorDBUrl={`${config.organization}&${config.repoName}`} apiKey={config.apiKey} />
            </AssistantModal.Content>
        </AssistantModal.Root>
    );
};

const MyAssistantModalTrigger: FC<AnalyticsData> = ({ repoName, organization, apiKey }) => {
    const posthog = usePostHog();

    return (
        <AssistantModal.Anchor className="hidden md:block">
            <AssistantModalPrimitive.Trigger asChild>
                <AssistantModal.Button onClick={() => posthog?.capture('chat_opened', {
                    apiKey,
                    repoName,
                    organization
                })}/>
            </AssistantModalPrimitive.Trigger>
        </AssistantModal.Anchor>
    );
};

const sendSlackQuery = async (apiKey: string, vectorDBUrl: string, chatHist: string, question: string, userEmail: string) => {
    try {
		const url = "http://localhost:8000/bot/send-query";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ApiKey: apiKey,
                VectorDBURL: vectorDBUrl,
                ChatHist: chatHist,
                Question: question,
                UserEmail: userEmail,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to send query. Please try again.");
        }
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An error occurred." };
    }
};

const OssSlack: FC<{
	numQuestions: number;
	apiKey: string;
	vectorDBUrl: string;
	chatHist: string;
}> = ({ numQuestions, apiKey, vectorDBUrl, chatHist }) => {
	const [showForm, setShowForm] = useState(false);
	const [email, setEmail] = useState('');
	const [question, setQuestion] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		if (!email || !question) {
			alert('Please enter both email and question.');
			return;
		}

		setLoading(true);
		setError(null);

		const result = await sendSlackQuery(
			apiKey,
			vectorDBUrl,
			chatHist,
			question,
			email
		);

		if (result.success) {
			setSubmitted(true);
		} else {
			setError('Error sending message. Please try again later!');
		}
		setLoading(false);
	};

	return (
		<div className="flex flex-col items-center">
			{numQuestions >= 3 && (
				<>
					{!showForm ? (
						<button
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
							onClick={() => setShowForm(true)}
						>
							Ask question to maintainer directly
						</button>
					) : (
						<div className="mt-4 p-4 border border-gray-300 rounded-lg shadow-md w-full max-w-md bg-white">
							{!submitted ? (
								<>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Email:
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
										placeholder="Enter your email"
									/>

									<label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
										Your Question:
									</label>
									<textarea
										value={question}
										onChange={(e) => setQuestion(e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
										placeholder="Enter your question"
										rows={3}
									></textarea>

									{error && (
										<p className="text-red-500 text-sm mt-2">{error}</p>
									)}

									<button
										className={`mt-3 w-full text-white py-2 rounded-md transition ${loading
												? 'bg-gray-400 cursor-not-allowed'
												: 'bg-green-600 hover:bg-green-700'
											}`}
										onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Thank you! Your question has been submitted.
                  </p>
                  <p className="mt-2">
                    <strong>Email:</strong> {email}
                  </p>
                  <p className="mt-1">
                    <strong>Question:</strong> {question}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MyThread:  FC<{ numQuestions: number; apiKey: string; vectorDBUrl: string }> = ({ numQuestions, apiKey, vectorDBUrl }) => {
	const { useThreadMessages } = useThreadContext();
	const messages = useThreadMessages();

	const chatHist = messages.map(({ role, content }) => {
        const text = content?.map((c) => (c.type === "text" ? c.text : "")).join(" ");
        return role === "user"
            ? `*Question:* ${text}`
            : `*Ans:* ${text}`;
    }).join("\n\n");

    return (
        <Thread.Root className="flex flex-col">
            <Thread.Viewport>
                <ThreadWelcome />

                <Thread.Messages />

				<OssSlack numQuestions={numQuestions} apiKey={apiKey} vectorDBUrl={vectorDBUrl} chatHist={chatHist} />
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
                            stroke="#FFC635" strokeWidth="1.2" strokeLinecap="round"/>
                        <circle cx="11.7874" cy="9.20663" r="0.5" fill="white" stroke="#FFC635" strokeWidth="0.531905"/>
                    </svg>
                    Entelligence
                </span>
            </a>
        </Thread.Root>
    );
};
