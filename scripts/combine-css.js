const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

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

// Minify the combined CSS
const minified = new CleanCSS({
  level: 2, // Advanced optimization level
  compatibility: '*', // IE10+ compatibility
  sourceMap: process.env.NODE_ENV === 'development'
}).minify(combinedCSS);

// Write minified CSS to output file
fs.writeFileSync(outputFile, minified.styles);
console.log(`Combined and minified CSS written to ${outputFile}`);
console.log(`Original size: ${combinedCSS.length} bytes`);
console.log(`Minified size: ${minified.styles.length} bytes`);
console.log(`Efficiency: ${((1 - minified.styles.length / combinedCSS.length) * 100).toFixed(2)}% reduction`); 