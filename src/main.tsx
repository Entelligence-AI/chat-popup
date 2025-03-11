import { createRoot } from 'react-dom/client';
import { EntelligenceChat } from './react';
import { InitType } from "@/types";

export const init = ({ analyticsData }: InitType) => {
    const reactContainer = document.createElement('div');
    reactContainer.id = 'react-app-container';
    document.body.appendChild(reactContainer);
    
    const root = createRoot(reactContainer);    
    root.render(<EntelligenceChat analyticsData={analyticsData} />);
};

export { init as EntelligenceChatInit };
export { EntelligenceChat } from './react';
export type { InitType } from './types';

