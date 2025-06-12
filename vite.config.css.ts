import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import CleanCSS from 'clean-css';

// Read the combined CSS
const combinedCSS = fs.readFileSync('src/combined.css', 'utf-8');

// Minify the CSS
const minified = new CleanCSS({
  level: 2,
  compatibility: '*',
  sourceMap: process.env.NODE_ENV === 'development'
}).minify(combinedCSS);

// Write minified CSS to dist folders
const writeMinifiedCSS = () => {
  // Ensure directories exist
  fs.mkdirSync('dist/react', { recursive: true });
  fs.mkdirSync('dist/vanilla', { recursive: true });
  
  // Write to both dist folders
  fs.writeFileSync('dist/react/style.css', minified.styles);
  fs.writeFileSync('dist/vanilla/style.css', minified.styles);
  
  console.log(`CSS minified and written to dist folders`);
  console.log(`Original size: ${combinedCSS.length} bytes`);
  console.log(`Minified size: ${minified.styles.length} bytes`);
  console.log(`Efficiency: ${((1 - minified.styles.length / combinedCSS.length) * 100).toFixed(2)}% reduction`);
};

writeMinifiedCSS();

export default defineConfig({
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/combined.css'),
      output: {
        assetFileNames: 'style.css'
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  }
}); 