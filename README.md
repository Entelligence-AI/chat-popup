# Entelligence Chat

This is a simple chat application that uses the Entelligence API + Assistant-UI to send and receive messages bases on your repository information.

## Requirements
- Entelligence API key
- Repository name

## Installation
```bash
pnpm install
```

## Usage

```bash
pnpm dev
```

## How to embed the chat in your website
you need to import the script, and after call the script to initialize the chat.

Properties:
- `analyticsData`: Object with the data that you want to send to the Entelligence API. The properties `apiKey` and `repository` are required.
- `apiKey`: The Entelligence API key.
- `repoName`: The repository name.

**Example**:
```html
<script type="module" src="https://d345f39z3arwqc.cloudfront.net/entelligence-chat.js"></script>
<script type="module">
  window.EntelligenceChat.init({
    analyticsData: {
      repoName: "my-repo",
      apiKey: "1234567890",
      // Other data
    }
  });
</script>
```

## Technologies
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [AssistanUi](https://assistant-ui.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)
