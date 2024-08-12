import {defineConfig, UserConfig} from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `entelligence-chat.js`,
        chunkFileNames: `entelligence-chat-chunk.js`,
        assetFileNames: `[name].[ext]`,
      }
    }
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
} satisfies UserConfig)
