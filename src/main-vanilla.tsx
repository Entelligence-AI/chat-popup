import { createRoot } from 'react-dom/client';
import { EntelligenceChat } from './react';
import { InitType } from "./types";

const init = ({ analyticsData }: InitType) => {
    if (typeof window === 'undefined') return;
    
    // Create container with shadow DOM
    const container = document.createElement('div');
    container.id = 'entelligence-chat-root';
    container.className = 'entelligence-chat-container';
    
    // Create and attach shadow DOM
    const shadow = container.attachShadow({ mode: 'open' });
    const shadowContainer = document.createElement('div');
    
    shadow.appendChild(shadowContainer);
    
    document.body.appendChild(container);
    
    // Initialize React after DOM is ready
    const initReact = () => {
        try {
            const root = createRoot(shadowContainer);
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