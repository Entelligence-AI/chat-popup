import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Copy assistant-ui CSS files
const assistantUICSS = fs.readFileSync('node_modules/@assistant-ui/react/dist/styles/index.css', 'utf-8');
const assistantUIModalCSS = fs.readFileSync('node_modules/@assistant-ui/react/dist/styles/modal.css', 'utf-8');

// Create a temporary file with all CSS combined
const combinedCSS = `${assistantUICSS}\n${assistantUIModalCSS}\n${fs.readFileSync('src/index.css', 'utf-8')}`;
fs.writeFileSync('.temp.css', combinedCSS);

export default defineConfig({
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: resolve(__dirname, '.temp.css'),
      output: {
        assetFileNames: 'entelligence-chat.css'
      }
    }
  },
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')]
    }
  }
}); 