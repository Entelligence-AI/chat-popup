import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isReactBuild = mode === 'react'
  
  const config = {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
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
      include: ['@assistant-ui/react-markdown']
    },
    plugins: [
      react(),
      dts({
        include: ['src'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        outDir: isReactBuild ? 'dist/types/react' : 'dist/types',
        rollupTypes: true,
        insertTypesEntry: true,             
      }),
      !isReactBuild && cssInjectedByJsPlugin()
    ].filter(Boolean),
    server: {
      port: 5173,
      open: true,
      host: true,
      hmr: {
        overlay: true
      }
    }
  } as UserConfig

  return config
})
