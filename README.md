# Entelligence Chat Widget

A customizable chat widget that provides AI-powered chat functionality based on your repository information. Available for both React and Vanilla JavaScript applications.

## Installation

```bash
# Using npm
npm install @entelligence-ai/chat-widget

# Using pnpm
pnpm add @entelligence-ai/chat-widget
```

## Usage

### React Component
```tsx
import { EntelligenceChat } from '@entelligence-ai/chat-widget/react';
// Import styles separately
import '@entelligence-ai/chat-widget/style.css';

function App() {
  return (
    <EntelligenceChat 
      analyticsData={{
        apiKey: "your-api-key",
        repoName: "your-repo",
        organization: "your-org",
        companyName: "Your Company",
        theme: "light"
      }} 
    />
  );
}
```

### Vanilla JavaScript
```html
<script type="module">
  import { EntelligenceChatInit } from '@entelligence-ai/chat-widget';
  import '@entelligence-ai/chat-widget/style.css';

  EntelligenceChatInit({
    analyticsData: {
      apiKey: "your-api-key",
      repoName: "your-repo",
      organization: "your-org",
      companyName: "Your Company",
      theme: "light"
    }
  });
</script>
```

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Setup
```bash

# Create .env file
cp .env.example .env

# Add your API keys to .env
VITE_API_KEY=your_api_key
VITE_ORGANIZATION=your_organization
VITE_REPO_NAME=your_repo_name
VITE_COMPANY_NAME=your_company_name

# Start development server
pnpm dev
```

### Development Environment
The development server will start at http://localhost:5173 with HMR enabled.

```bash
# Start in development mode
pnpm dev

# Build and watch for changes
pnpm build --watch

# Test production build locally
pnpm build && pnpm preview
```

### Build
```bash
# Build both React and Vanilla versions
pnpm build

# Build specific versions
pnpm build:react    # React version only
pnpm build:vanilla  # Vanilla JS version only
```

### Project Structure
```
src/
├── react/         # React-specific code
├── app/           # Main application components
├── types/         # TypeScript definitions
├── utils/         # Utility functions
├── main.tsx       # React entry point
├── main-vanilla.tsx # Vanilla JS entry point
└── react.tsx      # Main React component
```

### Technical Architecture

#### Entry Points and Initialization
The application follows this initialization flow:

1. Vite uses index.html as the entry point:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="node_modules/@entelligence-ai/chat-widget/style.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

2. The index.tsx file bootstraps the React application:
```typescript
// src/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './app';
import '@entelligence-ai/chat-widget/style.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

3. The main application component (App) initializes the chat:
```typescript
// src/app/index.tsx
export const App = ({
  apiKey,
  repoName,
  organization,
  theme,
}: AnalyticsData) => {
  return (
    <div className={theme}>
      <ChatErrorBoundary>
        <DocsChat
          apiKey={apiKey}
          organization={organization}
          repoName={repoName}
          companyName={companyName}
        />
      </ChatErrorBoundary>
    </div>
  );
};
```

### CSS and Styling
The package includes two CSS bundles:
- `@entelligence-ai/chat-widget/style.css` - Main styles for the widget
- `@entelligence-ai/chat-widget/styles.css` - Additional styles (if needed)

You must import at least the main style.css for the widget to work properly:
```typescript
import '@entelligence-ai/chat-widget/style.css';
```

### Environment Variables
Create a `.env` file in the root directory with:
```env
VITE_API_KEY=your_api_key
VITE_ORGANIZATION=your_organization
VITE_REPO_NAME=your_repo_name
```

### Local Testing
```bash
# Build the package
pnpm build

# Create a local tarball
pnpm pack

# Install in another project
cd ../your-test-project
pnpm add ../chat-widget/entelligence-ai-chat-widget-0.0.4.tgz
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Opera 47+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Support

- GitHub Issues: [Report a bug](https://github.com/Entelligence-AI/chat-widget/issues)
- Email: support@entelligence.ai
