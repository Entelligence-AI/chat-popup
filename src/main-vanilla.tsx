import { createRoot } from 'react-dom/client';
import { EntelligenceChat } from './react';
import { InitType } from "./types";
import './index.css';

const init = ({ analyticsData }: InitType) => {
    if (typeof window === 'undefined') return;
    
    // Create container and add to body
    const container = document.createElement('div');
    container.id = 'entelligence-chat-root';
    container.className = 'entelligence-chat-container';
    document.body.appendChild(container);
    
    // Initialize React after DOM is ready
    const initReact = () => {
        try {
            const root = createRoot(container);
            root.render(<EntelligenceChat analyticsData={analyticsData} />);
        } catch (err) {
            console.error('Failed to initialize chat:', err);
        }
    };
    
    // Ensure DOM is ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReact);
    } else {
        initReact();
    }
    
    // Return cleanup function
    return () => {
        container.remove();
    };
};

// Export for UMD/global usage
if (typeof window !== 'undefined') {
    (window as any).EntelligenceChat = { init };
}

export { init };