import { createRoot } from 'react-dom/client';
import { App } from './app';
import { InitType } from "@/types";
import { PostHogProvider} from 'posthog-js/react'

import './index.css';

const options = {
    api_host: 'https://us.i.posthog.com',
}

const init = ({ analyticsData }: InitType) => {
    const reactContainer = document.createElement('div');

    reactContainer.id = 'react-app-container';
    document.body.appendChild(reactContainer);
    const root = createRoot(reactContainer);
    const el = (
        <PostHogProvider
            apiKey='phc_1ttc13N2t7AvMZvzFdJ3ppJ1wJGDuql1nuo4Copgqbu'
            options={options}
        >
            <App {...analyticsData}/>
        </PostHogProvider>
    )
    root.render(el)
};

(window as any).EntelligenceChat = { init };

