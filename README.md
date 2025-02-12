# Entelligence Chat Widget

A customizable chat widget that provides AI-powered chat functionality based on your repository information. Available for both React and Vanilla JavaScript applications.

## Features

- 🔄 Universal compatibility (React & Vanilla JS)
- 🎨 Light/Dark theme support
- 📱 Responsive design
- ⚡ Lightweight bundle
- 🛠️ Easy configuration
- 🔒 TypeScript support

## Installation

```bash
# npm
npm install @entelligence-ai/chat-widget

# pnpm
pnpm add @entelligence-ai/chat-widget

# yarn
yarn add @entelligence-ai/chat-widget
```

## Usage

### React/Next.js
```tsx
import { EntelligenceChat } from '@entelligence-ai/chat-widget/react';
import '@entelligence-ai/chat-widget/style.css';

function App() {
  return (
    <EntelligenceChat 
      analyticsData={{
        repoName: "your-repo",
        organization: "your-org",
        apiKey: "your-api-key",
        theme: "light" // or "dark"
      }} 
    />
  );
}
```

### Vanilla JavaScript
```javascript
import { EntelligenceChat } from '@entelligence-ai/chat-widget';

EntelligenceChat.init({
  analyticsData: {
    repoName: "your-repo",
    organization: "your-org",
    apiKey: "your-api-key",
    theme: "light" // or "dark"
  }
});
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| repoName | string | Yes | - | Your repository name |
| organization | string | Yes | - | Your organization name |
| apiKey | string | Yes | - | Your API key |
| theme | 'light' \| 'dark' | No | 'light' | UI theme |
| disableArtifacts | boolean | No | false | Disable artifacts display |
| limitSources | number | No | undefined | Limit number of sources |

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Setup
```bash
# Clone the repository
git clone https://github.com/Entelligence-AI/chat-widget.git
cd chat-widget

# Install dependencies
pnpm install

# Start development server
pnpm dev
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
├── types/         # TypeScript definitions
├── utils/         # Utility functions
├── main.tsx       # React entry point
├── main-vanilla.tsx # Vanilla JS entry point
└── react.tsx      # Main React component
```

### Testing Locally
```bash
# Create a local build
pnpm build
pnpm pack

# In your test project
npm install /path/to/entelligence-ai-chat-widget-0.0.1.tgz
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
