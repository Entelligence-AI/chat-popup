import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

const init = ({ analyticsData }: { analyticsData: { apiKey: string }}) => {
    const reactContainer = document.createElement('div');
    reactContainer.id = 'react-app-container';

    if (!document.getElementById('react-app-container')) {
        document.body.appendChild(reactContainer);
        const root = createRoot(reactContainer);
        const el = (
            <React.StrictMode>
                <App apiKey={analyticsData.apiKey} />
            </React.StrictMode>
        )
        root.render(el)
    }
};

(window as any).ReactApp = { init };

