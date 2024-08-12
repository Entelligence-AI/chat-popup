import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import {AnalyticsData} from "@/types";

const init = ({ analyticsData }: AnalyticsData) => {
    const reactContainer = document.createElement('div');
    reactContainer.id = 'react-app-container';
    document.body.classList.add(analyticsData.theme)

    if (!document.getElementById('react-app-container')) {
        document.body.appendChild(reactContainer);
        const root = createRoot(reactContainer);
        const el = (
            <React.StrictMode>
                <App analyticsData={analyticsData} />
            </React.StrictMode>
        )
        root.render(el)
    }
};

(window as any).EntelligenceChat = { init };

