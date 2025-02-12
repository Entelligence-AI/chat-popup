import { FC, useEffect, useState } from 'react';
import {
  AssistantModal,
  AssistantModalPrimitive,
  ChatModelAdapter,
  useLocalRuntime,
  Thread,
  Composer,
  ThreadWelcome,
  type ThreadConfig,
  useThread,
} from '@assistant-ui/react';
import { makeMarkdownText } from '@assistant-ui/react-markdown';
import { makePrismAsyncSyntaxHighlighter } from '@assistant-ui/react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { FaSlack } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { createRoot } from 'react-dom/client';

import '@assistant-ui/react-markdown/styles/tailwindcss/markdown.css';
import '@assistant-ui/react/styles/index.css';
import '@assistant-ui/react/styles/modal.css';

import { AnalyticsData } from '@/types';
import { usePostHog } from 'posthog-js/react';

export const App = ({
  apiKey,
  repoName,
  organization,
  theme,
}: AnalyticsData) => {
  const posthog = usePostHog();
  const [numQuestions, setNumQuestions] = useState(0);

  useEffect(() => {
    posthog?.capture('chat_initialized', {
      apiKey,
      repoName,
      organization,
    });
  }, [apiKey, repoName, organization]);

  return (
    <div className={theme}>
      {apiKey && (
        <DocsChat
          apiKey={apiKey}
          organization={organization}
          repoName={repoName}
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
        />
      )}
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
    backgroundColor: 'black',
  },
});

const MarkdownText = makeMarkdownText({
  remarkPlugins: [remarkGfm],
  components: {
    SyntaxHighlighter,
  },
});

const MyCustomAdapter = ({
  apiKey,
  repoName,
  organization,
  setNumQuestions,
}: AnalyticsData) => {
  return {
    async *run({
      messages,
      abortSignal,
    }: {
      messages: any;
      abortSignal: AbortSignal;
    }) {
      const { content: question, role } = messages.pop()!;
      if (role !== 'user' || !question) throw new Error('No question provided');

      if (setNumQuestions) setNumQuestions((numQuestions) => numQuestions + 1);

      const response = await fetch(
        'https://entelligence.ddbrief.com/repositoryAgent/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            question: question[0]?.text,
            history: [],
            vectorDBUrl: `${organization}&${repoName}`,
            enableArtifacts: false,
            advancedAgent: false,
            limitSources: 3,
          }),
          signal: abortSignal,
        }
      );

      let text = '';
      for await (const chunk of asAsyncIterable<any>(
        response.body!.pipeThrough(new TextDecoderStream())
      )) {
        text += chunk;
        yield { content: [{ type: 'text', text }] };
      }
    },
  };
};

export const DocsChat = ({
  repoName,
  organization,
  apiKey,
  setNumQuestions,
  numQuestions,
}: AnalyticsData) => {
  const adapter = MyCustomAdapter({
    apiKey,
    repoName,
    organization,
    numQuestions,
    setNumQuestions,
  });
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

const MyAssistantModal: FC<ThreadConfig & AnalyticsData> = (config) => {
  return (
    <AssistantModal.Root config={config}>
      <MyAssistantModalTrigger
        apiKey={config.apiKey}
        repoName={config.repoName}
        organization={config.organization}
        numQuestions={config.numQuestions}
        setNumQuestions={config.setNumQuestions}
      />
      <AssistantModal.Content style={{ width: '600px', height: '620px' }}>
        <MyThread
          numQuestions={config.numQuestions}
          vectorDBUrl={`${config.organization}&${config.repoName}`}
          apiKey={config.apiKey}
        />
      </AssistantModal.Content>
    </AssistantModal.Root>
  );
};

const MyAssistantModalTrigger: FC<AnalyticsData> = ({
  repoName,
  organization,
  apiKey,
}) => {
  const posthog = usePostHog();

  return (
    <AssistantModal.Anchor className="hidden md:block">
      <AssistantModalPrimitive.Trigger asChild>
        <AssistantModal.Button
          onClick={() =>
            posthog?.capture('chat_opened', {
              apiKey,
              repoName,
              organization,
            })
          }
        />
      </AssistantModalPrimitive.Trigger>
    </AssistantModal.Anchor>
  );
};

const sendSlackQuery = async (
  apiKey: string,
  vectorDBUrl: string,
  chatHist: string,
  question: string,
  userEmail: string
) => {
  try {
    const url = 'https://entelligence.ddbrief.com/bot/send-query';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error('Failed to send query. Please try again.');
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred.',
    };
  }
};

const isOssQueryAllowed = async (
  apiKey: string,
  vectorDBUrl: string
): Promise<boolean> => {
  try {
    const url = 'https://entelligence.ddbrief.com/bot/allow-query';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ApiKey: apiKey,
        VectorDBURL: vectorDBUrl,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.allowed === true;
  } catch (error) {
    return false;
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
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    const checkIfOssQueryIsAllowed = async () => {
      const result = await isOssQueryAllowed(apiKey, vectorDBUrl);
      setAllowed(result);
    };
    checkIfOssQueryIsAllowed();
  }, [apiKey, vectorDBUrl]);

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
    <div className="flex flex-col items-end w-full">
      {!allowed ? (
        <div></div>
      ) : (
        numQuestions >= 3 && (
          <>
            {!showForm ? (
              <button
                className="mt-4 p-2 rounded-md shadow-md hover:opacity-80 transition relative group flex items-center gap-2"
                onClick={() => setShowForm(true)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#3c3c3c]">
                    Reach Owners on Slack
                  </span>
                  <FaSlack size={24} className="text-[#c7e576]" />
                </span>
              </button>
            ) : (
              <div className="mt-4 p-3 border border-gray-300 rounded-lg shadow-md w-full max-w-sm bg-white relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowForm(false)}
                >
                  <IoClose size={20} />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <FaSlack size={24} className="text-[#c7e576]" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    Reach Owners on Slack
                  </h3>
                </div>

                {!submitted ? (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 bg-[#f4f4f4] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Email"
                    />

                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full p-2 mt-3 bg-[#f4f4f4] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter your question"
                      rows={3}
                    ></textarea>

                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <button
                        className={`px-4 py-1 text-sm text-black rounded-md transition ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#C7E576] hover:opacity-80'
                        }`}
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
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
        )
      )}
    </div>
  );
};

const MyThread: FC<{
  numQuestions: number;
  apiKey: string;
  vectorDBUrl: string;
}> = ({ numQuestions, apiKey, vectorDBUrl }) => {
  const thread = useThread();
  const messages = thread.messages;

  const chatHist = messages
    .map(({ role, content }) => {
      const text = content
        ?.map((c) => (c.type === 'text' ? c.text : ''))
        .join(' ');
      return role === 'user' ? `*Question:* ${text}` : `*Ans:* ${text}`;
    })
    .join('\n\n');

  return (
    <Thread.Root className="flex flex-col">
      <Thread.Viewport>
        <ThreadWelcome />

        <Thread.Messages />

        <OssSlack
          numQuestions={numQuestions}
          apiKey={apiKey}
          vectorDBUrl={vectorDBUrl}
          chatHist={chatHist}
        />
        <Thread.ViewportFooter className="pb-3">
          <Thread.ScrollToBottom />
          <Composer />
        </Thread.ViewportFooter>
      </Thread.Viewport>

      <a
        href="https://entelligence.ai"
        className="text-muted-foreground flex w-full items-center justify-center gap-2 border-t py-2 text-xs"
      >
        In partnership with{' '}
        <span className="flex items-center gap-2">
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_dd_932_2270)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M32.2625 12.463C32.3444 12.8243 32.0637 13.1597 31.6933 13.1597H25.9438C24.7036 9.20076 21.0066 6.32829 16.6387 6.32829C12.2708 6.32829 8.57374 9.20076 7.33357 13.1597H1.58355C1.21316 13.1597 0.932391 12.8243 1.01429 12.463C2.63221 5.32729 9.01318 0 16.6384 0C24.2636 0 30.6446 5.32729 32.2625 12.463ZM7.29862 18.8814C7.03244 17.9934 6.88943 17.0522 6.88943 16.0776C6.88943 15.0611 7.04498 14.081 7.33357 13.1597H25.9438C26.2324 14.081 26.3879 15.0611 26.3879 16.0776C26.3879 17.0522 26.2449 17.9934 25.9788 18.8814H7.29862ZM16.078 26.3725C16.078 26.0574 15.8313 25.799 15.5182 25.7632C11.6072 25.3156 8.39949 22.5539 7.29862 18.8814H1.58355C1.21316 18.8814 0.932391 19.2168 1.01429 19.5781C2.54837 26.344 8.36465 31.4841 15.4635 31.9987C15.7988 32.023 16.078 31.7527 16.078 31.4165V26.3725ZM25.9788 18.8814C25.9788 18.8814 25.9787 18.8814 25.9788 18.8814H31.6933C31.6959 18.8814 31.6985 18.8814 31.7011 18.8814H25.9788Z"
                fill="#D3F674"
              />
            </g>
            <defs>
              <filter
                id="filter0_dd_932_2270"
                x="0.263188"
                y="0"
                width="32.751"
                height="33.4739"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="0.736812" />
                <feGaussianBlur stdDeviation="0.368406" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_932_2270"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="0.650823" />
                <feGaussianBlur stdDeviation="0.113894" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect1_dropShadow_932_2270"
                  result="effect2_dropShadow_932_2270"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect2_dropShadow_932_2270"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
          Entelligence
        </span>
      </a>
    </Thread.Root>
  );
};
