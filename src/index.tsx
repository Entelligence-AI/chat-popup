
// Add more debugging
console.log('Starting application...');

try {
  // Import the CSS loader
  const { loadCSS } = await import('./css-loader');
  
  // Load CSS programmatically
  loadCSS();
  console.log('CSS loaded successfully');
  
  if (import.meta.env.DEV) {
    const rootElement = document.getElementById('root');
    console.log('Root element:', rootElement);
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    // Import React components
    const { createRoot } = await import('react-dom/client');
    const { App } = await import('./app');
    const { StrictMode } = await import('react');
    
    console.log('React modules loaded');
    
    const analyticsData = {
      apiKey: "test-api-key",
      repoName: "chat-popup",
      organization: "Entelligence-AI",
      theme: "light" as const,
      companyName: "Entelligence AI",    
    };
    
    document.body.classList.add(analyticsData?.theme || 'light');
    const root = createRoot(rootElement);
    
    console.log('Root created, rendering app...');
    
    root.render(
      <StrictMode>
        <App {...analyticsData} />
      </StrictMode>
    );
    
    console.log('App rendered');
  }
} catch (error) {
  console.error('Error initializing app:', error);
}

// Re-export everything from main for the library build
export * from './main';