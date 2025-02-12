import { App } from './app';
import { InitType } from "@/types";
import { PostHogProvider } from 'posthog-js/react';

const options = {
    api_host: 'https://us.i.posthog.com',
}

export const EntelligenceChat = ({ analyticsData }: InitType) => (
    <PostHogProvider
        apiKey='phc_1ttc13N2t7AvMZvzFdJ3ppJ1wJGDuql1nuo4Copgqbu'
        options={options}
    >
        <div className="entelligence-chat-container">
            <App {...analyticsData}/>
        </div>
    </PostHogProvider>
); 