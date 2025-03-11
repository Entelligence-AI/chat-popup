const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all instances of the problematic file
const files = glob.sync('node_modules/**/@assistant-ui/react/**/createContextHook.{mjs,js}');

files.forEach(file => {
  console.log(`Patching ${file}`);
  
  // Create a backup if it doesn't exist
  const backupFile = `${file}.bak`;
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(file, backupFile);
  }
  
  // Write the patched version
  const patchedCode = `
import React from 'react';

function createContextHook(context, providerName) {
  function useContextHook(options) {
    const value = React.useContext(context);
    if (!value && options?.strict === true) {
      const error = new Error(\`\${providerName || 'Provider'} not found\`);
      error.name = 'ProviderError';
      throw error;
    }
    return value;
  }
  return useContextHook;
}

export { createContextHook };
`;
  
  fs.writeFileSync(file, patchedCode);
});

console.log('Patching complete'); 