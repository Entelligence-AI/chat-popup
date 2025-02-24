import { EntelligenceChat } from './react';
import { InitType } from "./types";
import ReactDOM from 'react-dom/client';
import React from 'react';

// Import styles
import indexStyles from './index.css?inline';
import assistantMarkdownStyles from '@assistant-ui/react-markdown/styles/markdown.css?inline';
import assistantReactStyles from '@assistant-ui/react/styles/index.css?inline';
import assistantModalStyles from '@assistant-ui/react/styles/modal.css?inline';

const styles = `
${indexStyles}
${assistantMarkdownStyles}
${assistantReactStyles}
${assistantModalStyles}

.entelligence-chat-markdown {
  /* Basic markdown styles */
  & pre {
    overflow-x: auto;
    padding: 1rem;
    background: #1e1e1e;
    border-radius: 0.375rem;
  }
  
  & code {
    font-family: ui-monospace, monospace;
    font-size: 0.9em;
  }

  & p {
    margin: 1em 0;
  }

  & ul, & ol {
    padding-left: 1.5em;
    margin: 1em 0;
  }

  & h1, & h2, & h3, & h4, & h5, & h6 {
    margin: 1.5em 0 0.5em;
    line-height: 1.2;
  }
}`;

const createWidget = (config: InitType) => {
  const root = document.createElement('div');
  root.id = 'entelligence-chat-root';
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style); // Add the style to document head
  
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <EntelligenceChat {...config} />
    </React.StrictMode>
  );

  return () => {
    reactRoot.unmount();
    root.remove();
    style.remove(); // Clean up styles when unmounting
  };
};

export { createWidget };