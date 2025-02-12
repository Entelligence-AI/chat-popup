import {defineConfig, UserConfig} from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isReactBuild = mode === 'react'
  console.log('isReactBuild', isReactBuild)
  
  return {
    define: {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false',
      'global': 'globalThis'
    },
    build: {
      minify: 'esbuild',
      sourcemap: true,
      emptyOutDir: false,
      outDir: isReactBuild ? 'dist/react' : 'dist/vanilla',
      lib: {
        entry: isReactBuild ? resolve(__dirname, 'src/react.tsx') : resolve(__dirname, 'src/main.tsx'),
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
          exports: 'named',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    },
    plugins: [
      react({
        jsxRuntime: 'classic'
      }),
      cssInjectedByJsPlugin({
        useStrictCSP: true,
        styleId: 'entelligence-chat-styles',
        injectCode: (cssText: string) => `
          if (!window.entelligenceStylesInjected) {
            const shadow = document.createElement('div');
            shadow.attachShadow({ mode: 'open' });
            document.body.appendChild(shadow);
            const style = document.createElement('style');
            style.textContent = ${cssText};
            shadow.shadowRoot.appendChild(style);
            window.entelligenceStylesInjected = true;
          }
        `
      })
    ]
  } as UserConfig
})
