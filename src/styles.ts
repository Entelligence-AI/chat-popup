import { tailwindStyles } from './styles/tailwind-output';
import assistantStyles from '@assistant-ui/react/dist/styles/index.css';
import modalStyles from '@assistant-ui/react/dist/styles/modal.css';

// Scope Tailwind styles to the shadow root
const scopedTailwindStyles = `:host {
  all: initial;
}

${tailwindStyles}`;

export const styles = {
  tailwind: scopedTailwindStyles,
  assistant: assistantStyles,
  modal: modalStyles
}; 