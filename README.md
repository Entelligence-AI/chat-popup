# Entelligence Chat Widget

A customizable chat widget that provides AI-powered chat functionality based on your repository information. Available for both React and Vanilla JavaScript applications.

## Installation

```bash
npm install
```

```bash
pnpm install
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
        />
      </ChatErrorBoundary>
    </div>
  );
};
```

4. The build process creates two distinct bundles:
   - A React component library for direct React integration
   - A vanilla JS bundle that can self-initialize

#### Build Configuration
The project uses Vite with dual build modes for React and Vanilla JS:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: mode === 'react' 
        ? 'src/react/index.ts'
        : 'src/main-vanilla.tsx',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['@assistant-ui/react'],
        'markdown': ['@assistant-ui/react-markdown'],
        'syntax': ['@assistant-ui/react-syntax-highlighter']
      }
    }
  }
}))
```

#### HTML Integration
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { EntelligenceChat } from './src/main.tsx'
    
    const container = document.getElementById('chat-widget')
    EntelligenceChat.init({
      analyticsData: {
        repoName: import.meta.env.VITE_REPO_NAME,
        organization: import.meta.env.VITE_ORGANIZATION,
        apiKey: import.meta.env.VITE_API_KEY
      }
    }, container)
  </script>
</head>
<body>
  <div id="chat-widget"></div>
</body>
</html>
```

#### Build Process
1. Vite builds two versions:
   - React component library (`/react`)
   - Vanilla JS bundle
2. Code is optimized through:
   - Tree shaking
   - Code splitting
   - Chunk optimization
   - CSS code splitting
3. Output includes:
   - ES modules
   - UMD bundles
   - TypeScript declarations

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
