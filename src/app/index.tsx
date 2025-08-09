import { FC, useEffect, useState } from 'react';
import {
  AssistantModalPrimitive,
  ChatModelAdapter,
  useLocalRuntime,
  type ThreadMessage,
  useThread,
} from '@assistant-ui/react';
import {
  Thread,
  Composer,
  AssistantModal,  
  ThreadWelcome,
  type ThreadConfig,
} from '@assistant-ui/react-ui';
import { MarkdownText } from '@/components/assistant-ui/markdown-text';
import { FaSlack } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

import '@assistant-ui/react/styles/index.css';
import '@assistant-ui/react/styles/modal.css';

import { AnalyticsData } from '@/types';
import { usePostHog } from 'posthog-js/react';

export const App = ({
  apiKey,
  repoName,
  organization,
  theme,
  companyName,
}: AnalyticsData) => {
  const posthog = usePostHog();

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
          companyName={companyName}
          repoName={repoName}
          theme={theme}
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

const MyCustomAdapter = ({
  apiKey,
  repoName,
  organization,
}: AnalyticsData) => ({
  async *run({
    messages,
    abortSignal,
  }: {
    messages: readonly ThreadMessage[];
    abortSignal: AbortSignal;
  }) {
    const messagesToSend = messages.map((m) => ({
      role: m.role,
      content: m.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join(' '),
    }));

    const response = await fetch(
      'https://entelligence.ddbrief.com/repositoryAgent/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          question: messagesToSend.at(-1)?.content,
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
    for await (const chunk of asAsyncIterable(
      response.body!.pipeThrough(new TextDecoderStream())
    )) {
      text += chunk;
      yield { content: [{ type: 'text', text }] };
    }
  },
});

export const DocsChat = ({
  repoName,
  organization,
  companyName,
  apiKey,
  theme,
}: AnalyticsData) => {
  const adapter = MyCustomAdapter({
    apiKey,
    repoName,
    organization,
  });
  const runtime = useLocalRuntime(adapter as ChatModelAdapter);
  return (
    <MyAssistantModal
      runtime={runtime}
      welcome={{
        message: `Ask any question about ${companyName}`,
      }}
      assistantMessage={{ components: { Text: MarkdownText } }}
      organization={organization}
      repoName={repoName}
      apiKey={apiKey}
      theme={theme}
    />
  );
};

const MyAssistantModal: FC<ThreadConfig & AnalyticsData> = (config) => {
  return (
    <AssistantModal.Root config={config}>
      <MyAssistantModalTrigger theme={config.theme} />
      <AssistantModal.Content className="h-[620px] w-[600px]">
        <MyThread
          vectorDBUrl={`${config.organization}&${config.repoName}`}
          apiKey={config.apiKey}
          theme={config.theme}
        />
      </AssistantModal.Content>
    </AssistantModal.Root>
  );
};

const MyAssistantModalTrigger: FC<{ theme?: string }> = ({
  theme = 'light',
}) => {
  return (
    <AssistantModal.Anchor className="hidden md:block">
      <AssistantModalPrimitive.Trigger asChild>
        <AssistantModal.Button>
          <ChatIcon theme={theme} />
        </AssistantModal.Button>
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
try {
  const data = await response.json();
  return data.allowed === true;
} catch (error) {
  console.error('Error checking permissions:', error);
  return false;
}};

const OssSlack: FC<{
  apiKey: string;
  vectorDBUrl: string;
  chatHist: Array<{ question: string; answer: string }>;
  theme?: string;
}> = ({ apiKey, vectorDBUrl, chatHist, theme = 'light' }) => {
  const validTheme = theme === 'dark' ? 'dark' : 'light';
  const isDark = validTheme === 'dark';

  const bgColor = isDark ? 'bg-[#1f1f26]' : 'bg-white';
  const textColor = isDark ? 'text-gray-300' : 'text-gray-800';
  const borderColor = isDark ? 'border-[#4a4a4f]' : 'border-gray-300';
  const buttonBgColor = isDark
    ? 'bg-[#C7E576] text-gray-900'
    : 'bg-[#C7E576] text-black';
  const hoverEffect = isDark ? 'hover:opacity-80' : 'hover:opacity-90';

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
      JSON.stringify(chatHist),
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
    <div className={`flex flex-col items-end w-full ${isDark ? 'dark' : ''}`}>
      {!allowed ? (
        <div></div>
      ) : (
        <>
          {!showForm ? (
            <button
              className={`mt-4 p-3 border ${borderColor} rounded-lg shadow-md ${hoverEffect} transition flex items-center gap-2 ${bgColor} ${textColor}`}
              onClick={() => setShowForm(true)}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Reach Owners on Slack
                </span>
                <FaSlack size={24} className="text-[#c7e576]" />
              </span>
            </button>
          ) : (
            <div
              className={`mt-4 p-3 border ${borderColor} rounded-lg shadow-md w-full max-w-sm ${bgColor} relative`}
            >
              <button
                className={`absolute top-2 right-2 text-gray-500 ${
                  isDark
                    ? 'dark:text-gray-400 hover:dark:text-gray-300'
                    : 'hover:text-gray-700'
                }`}
                onClick={() => setShowForm(false)}
              >
                <IoClose size={20} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <FaSlack size={24} className="text-[#c7e576]" />
                <h3 className={`text-lg font-semibold ${textColor}`}>
                  Reach Owners on Slack
                </h3>
              </div>

              {!submitted ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2 bg-transparent border ${borderColor} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${textColor} placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Email"
                  />

                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className={`w-full p-2 mt-3 bg-transparent border ${borderColor} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${textColor} placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Enter your question"
                    rows={3}
                  ></textarea>

                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      className={`px-4 py-1 text-sm rounded-md transition ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed text-black dark:text-gray-700'
                          : `${buttonBgColor} ${hoverEffect}`
                      }`}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </>
              ) : (
                <div className={`text-center ${textColor}`}>
                  <p className="text-sm">
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

const MyThread: FC<{
  apiKey: string;
  vectorDBUrl: string;
  theme?: string;
}> = ({ apiKey, vectorDBUrl, theme = 'light' }) => {
  const messages = useThread((t) => t.messages);

  const lastThreeQA = [];
  const reversedMessages = [...messages].reverse();
  let currentPair: { question?: string; answer?: string } = {};

  for (const message of reversedMessages.reverse()) {
    const text = message.content
      ?.map((c) => (c.type === 'text' ? c.text : ''))
      .join(' ');

    if (message.role === 'assistant' && currentPair.question) {
      currentPair.answer = text;
      lastThreeQA.push(currentPair);
      currentPair = {};
    } else if (message.role === 'user') {
      currentPair.question = text;
    }
    if (lastThreeQA.length >= 3) break;
  }
  const chatHist = lastThreeQA.map((pair) => ({
    question: pair.question ?? '',
    answer: pair.answer ?? '',
  }));

  return (
    <Thread.Root className="flex flex-col">
      <Thread.Viewport>
        <ThreadWelcome />
        <Thread.Messages />
        <OssSlack
          apiKey={apiKey}
          vectorDBUrl={vectorDBUrl}
          chatHist={chatHist}
          theme={theme}
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
        <ChatIcon
          width={16}
          height={16}
          theme={theme === 'light' ? 'dark' : 'light'}
        />{' '}
        <span className="flex items-center gap-2">Entelligence</span>
      </a>
    </Thread.Root>
  );
};

const ChatIcon = ({
  width,
  height,
  theme,
}: {
  width?: number;
  height?: number;
  theme?: string;
}) => {
  return (
    <svg
      width={width ?? 34}
      height={height ?? 34}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_dd_932_2270)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M32.2625 12.463C32.3444 12.8243 32.0637 13.1597 31.6933 13.1597H25.9438C24.7036 9.20076 21.0066 6.32829 16.6387 6.32829C12.2708 6.32829 8.57374 9.20076 7.33357 13.1597H1.58355C1.21316 13.1597 0.932391 12.8243 1.01429 12.463C2.63221 5.32729 9.01318 0 16.6384 0C24.2636 0 30.6446 5.32729 32.2625 12.463ZM7.29862 18.8814C7.03244 17.9934 6.88943 17.0522 6.88943 16.0776C6.88943 15.0611 7.04498 14.081 7.33357 13.1597H25.9438C26.2324 14.081 26.3879 15.0611 26.3879 16.0776C26.3879 17.0522 26.2449 17.9934 25.9788 18.8814H7.29862ZM16.078 26.3725C16.078 26.0574 15.8313 25.799 15.5182 25.7632C11.6072 25.3156 8.39949 22.5539 7.29862 18.8814H1.58355C1.21316 18.8814 0.932391 19.2168 1.01429 19.5781C2.54837 26.344 8.36465 31.4841 15.4635 31.9987C15.7988 32.023 16.078 31.7527 16.078 31.4165V26.3725ZM25.9788 18.8814C25.9788 18.8814 25.9787 18.8814 25.9788 18.8814H31.6933C31.6959 18.8814 31.6985 18.8814 31.7011 18.8814H25.9788Z"
          fill={theme === 'dark' ? 'black' : '#D3F674'}
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
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
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
  );
};
