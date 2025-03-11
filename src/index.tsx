// Remove the unused React import since we're using automatic JSX runtime

// Add more debugging
console.log('Starting application...');

function initApp() {
  if (import.meta.env.DEV) {
    const rootElement = document.getElementById('root');
    console.log('Root element:', rootElement);
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    // Import React components
    Promise.all([
      import('react-dom/client'),
      import('./app'),
      import('react')
    ]).then(([{ createRoot }, { App }, { StrictMode }]) => {
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
    }).catch(error => {
      console.error('Error initializing app:', error);
    });
  }
}

try {
  initApp();
} catch (error) {
  console.error('Error initializing app:', error);
}

// Re-export everything from main for the library build
export * from './main';