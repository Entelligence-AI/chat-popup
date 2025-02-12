import { createRoot } from 'react-dom/client';
import { EntelligenceChat } from './react';
import { InitType } from "./types";
import './index.css';

const init = ({ analyticsData }: InitType) => {
    if (typeof window === 'undefined') return;
    
    const reactContainer = document.createElement('div');
    reactContainer.id = 'react-app-container';
    document.body.appendChild(reactContainer);
    
    const root = createRoot(reactContainer);
    root.render(<EntelligenceChat analyticsData={analyticsData} />);
};

if (typeof window !== 'undefined') {
    (window as any).EntelligenceChat = { init };
}

export { init };

