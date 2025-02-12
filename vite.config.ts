import {defineConfig, UserConfig} from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isReactBuild = mode === 'react'
  
  return {
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    build: {
      minify: 'esbuild',
      sourcemap: true,
      emptyOutDir: false,
      outDir: isReactBuild ? 'dist/react' : 'dist/vanilla',
      lib: {
        entry: isReactBuild ? resolve(__dirname, 'src/react/index.ts') : resolve(__dirname, 'src/main-vanilla.tsx'),
        name: 'EntelligenceChat',
        formats: ['es', 'umd'],
        fileName: (format) => `entelligence-chat${isReactBuild ? '-react' : ''}.${format}.js`
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'ReactJSXRuntime'
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'index.css';
            return assetInfo.name;
          }
        }
      },
      cssCodeSplit: false
    },
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }
    },
    optimizeDeps: {
      include: ['@assistant-ui/react-markdown/styles/tailwindcss/markdown.css']
    },
    plugins: [
      react(),
      dts({
        include: ['src'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        outDir: 'dist/types',
        rollupTypes: true
      }),
      !isReactBuild && cssInjectedByJsPlugin({
        topExecutionPriority: false,
        styleId: 'entelligence-chat-styles',
        injectCode: (cssText) => `
          (function() {
            if (typeof document === 'undefined') return;
            const id = 'entelligence-chat-styles';
            if (!document.getElementById(id)) {
              const style = document.createElement('style');
              style.id = id;
              style.textContent = ${cssText};
              document.head.appendChild(style);
            }
          })();
        `
      })
    ].filter(Boolean)
  } as UserConfig
})
