import { createRoot } from 'react-dom/client';
import { App } from './app';
import { StrictMode } from 'react';
import type { InitType } from './types';

// Only run this in development
if (import.meta.env.DEV) {
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement); // Debug

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const analyticsData: InitType['analyticsData'] = {
    apiKey: "test-api-key",
    repoName: "chat-popup",
    organization: "Entelligence-AI",
    theme: "light",
  };

  document.body.classList.add(analyticsData?.theme || 'light');

  const root = createRoot(rootElement);
  
  const app = (
    <StrictMode>
      <App {...analyticsData} />
    </StrictMode>
  );

  console.log('Rendering app:', app); // Debug
  root.render(app);
}

// Re-export everything from main for the library build
export * from './main';