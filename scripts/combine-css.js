const fs = require('fs');
const path = require('path');

// Paths to CSS files
const cssFiles = [
  './src/index.css',
  './node_modules/@assistant-ui/react/dist/styles/index.css',
  './node_modules/@assistant-ui/react/dist/styles/modal.css',
  './node_modules/@assistant-ui/react-markdown/styles/dot.css'
];

// Output file
const outputFile = './src/combined.css';

// Combine CSS files
let combinedCSS = '';

cssFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const css = fs.readFileSync(file, 'utf8');
      combinedCSS += `/* From ${file} */\n${css}\n\n`;
      console.log(`Added ${file}`);
    } else {
      console.warn(`File not found: ${file}`);
      
      // Try alternative paths
      const altPath = file.replace('/dist', '');
      if (fs.existsSync(altPath)) {
        const css = fs.readFileSync(altPath, 'utf8');
        combinedCSS += `/* From ${altPath} */\n${css}\n\n`;
        console.log(`Added alternative path: ${altPath}`);
      } else {
        console.warn(`Alternative path not found: ${altPath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

// Write combined CSS to output file
fs.writeFileSync(outputFile, combinedCSS);
console.log(`Combined CSS written to ${outputFile}`); 