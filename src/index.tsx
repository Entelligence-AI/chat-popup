import React from 'react';
import ReactDOM from 'react-dom';
import { App, DocsChat } from './app';

const init = ({ analyticsData }) => {
    const reactContainer = document.createElement('div');
    reactContainer.className = 'react-app-container';
    document.body.appendChild(reactContainer);

    ReactDOM.render(
            <>
                <App apiKey={analyticsData.apiKey} />
                <DocsChat />
            </>,
        reactContainer
    );
};

if (window !== undefined) {
    // Expose the init function globally
    (window as any).ReactApp = { init };
}

