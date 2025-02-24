import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isReactBuild = mode === 'react';

  const config = {
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.MODE': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      minify: 'esbuild',
      sourcemap: false,
      emptyOutDir: false,
      outDir: isReactBuild ? 'dist/react' : 'dist/vanilla',
      lib: {
        entry: isReactBuild 
          ? resolve(__dirname, 'src/react/index.ts')
          : resolve(__dirname, 'src/main-vanilla.tsx'),
        name: 'EntelligenceChat',
        formats: ['es', 'umd'],
        fileName: (format) => `entelligence-chat${isReactBuild ? '-react' : ''}.${format}.js`
      },
      rollupOptions: {
        external: isReactBuild
          ? [
              'react', 
              'react-dom', 
              'react/jsx-runtime',
              '@assistant-ui/react-markdown',
              '@emotion/react',
              '@emotion/styled'
            ]
          : [],
        output: {
          ...(isReactBuild ? {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'ReactJSXRuntime',
              '@assistant-ui/react-markdown': 'AssistantUIReactMarkdown',
              '@emotion/react': 'emotionReact',
              '@emotion/styled': 'emotionStyled'
            }
          } : {
            name: 'EntelligenceChat',
            format: 'umd',
            exports: 'named'
          })
        }
      },
      cssCodeSplit: false,
      target: 'esnext',
      reportCompressedSize: false,
    },
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
    },
    optimizeDeps: {
      exclude: ['@assistant-ui/react-markdown'],
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
      cssInjectedByJsPlugin({
        jsAssetsFilterFunction: (asset) => true, // Include all CSS
        topExecutionPriority: true,
      }),
    ].filter(Boolean),
    server: {
      port: 5173,
      open: true,
      host: true,
      hmr: {
        overlay: true,
      },
    },
  } as UserConfig;

  return config;
});
