import { createRoot } from 'react-dom/client';
import { EntelligenceChat } from './react';
import { InitType } from "@/types";
import './index.css';

export const init = ({ analyticsData }: InitType) => {
    const reactContainer = document.createElement('div');
    reactContainer.id = 'react-app-container';
    document.body.appendChild(reactContainer);
    
    const root = createRoot(reactContainer);
    root.render(<EntelligenceChat analyticsData={analyticsData} />);
};

// For vanilla JS usage
(window as any).EntelligenceChat = { init };
export { init as EntelligenceChat };

