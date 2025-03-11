import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import type { Mode } from 'vite';
import commonjs from '@rollup/plugin-commonjs';
import type { AssetInfo } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: Mode }) => {
  const isReactBuild = mode === 'react';

  // Create a virtual module for the patched file
  const virtualModuleId = 'virtual:createContextHook';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

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
        'style-to-js': resolve(__dirname, 'node_modules/style-to-js'),
        'style-to-js/cjs/index.js': resolve(__dirname, 'node_modules/style-to-js/cjs/index.js'),
        'style-to-js/cjs': resolve(__dirname, 'node_modules/style-to-js/cjs'),
        'debug': resolve(__dirname, 'node_modules/debug/src/browser.js'),
        'extend': resolve(__dirname, 'node_modules/extend/index.js'),
        'util': resolve(__dirname, 'src/polyfills/util.ts'),
        'secure-json-parse': resolve(__dirname, 'src/polyfills/secure-json-parse.js'),
        'classnames': resolve(__dirname, 'src/polyfills/classnames.js'),
        'react': resolve(__dirname, 'node_modules/react'),
        'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
      mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.css']
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
        formats: ['es'],
        fileName: (format: string) =>
          `entelligence-chat${isReactBuild ? '-react' : ''}.${format}.js`,
        requireReturnsDefault: 'auto',
        esmExternals: true,
      },
      rollupOptions: {
        external: isReactBuild
          ? [
              'react',
              'react-dom',
              'react/jsx-runtime',
              '@assistant-ui/react-markdown',
              '@emotion/react',
              '@emotion/styled',
            ]
          : [],
        input: {
          main: isReactBuild
            ? resolve(__dirname, 'src/react/index.ts')
            : resolve(__dirname, 'src/main-vanilla.tsx')
        },
        output: {
          ...(isReactBuild
            ? {
                globals: {
                  react: 'React',
                  'react-dom': 'ReactDOM',
                  'react/jsx-runtime': 'ReactJSXRuntime',
                  '@assistant-ui/react-markdown': 'AssistantUIReactMarkdown',
                  '@emotion/react': 'emotionReact',
                  '@emotion/styled': 'emotionStyled',
                },
              }
            : {
                name: 'EntelligenceChat',
                format: 'umd',
                exports: 'named',
              }),
          inlineDynamicImports: false,
          assetFileNames: (assetInfo: AssetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          interop: 'compat',
          format: 'es',
          esModule: true,
          exports: 'named'
        },
      },
      cssCodeSplit: true,
      target: 'esnext',
      reportCompressedSize: false,
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        defaultIsModuleExports: 'auto',
        requireReturnsDefault: 'preferred'
      },
    },
    css: {
      postcss: false,
      modules: false,
      preprocessorOptions: {},
      transformer: 'none'
    },
    optimizeDeps: {
      include: ['secure-json-parse', 'classnames'],
      exclude: [
        '@assistant-ui/react-markdown', 
        '@assistant-ui/react',
        '@assistant-ui/react/styles/index.css',
        '@assistant-ui/react/styles/modal.css'
      ]
    },
    plugins: [
      cssInjectedByJsPlugin({
        topExecutionPriority: true,
      }),
      react({
        fastRefresh: false,
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
      }),
      commonjs({
        requireReturnsDefault: 'preferred',
        transformMixedEsModules: true,
        extensions: ['.js', '.cjs'],
        ignore: ['@assistant-ui/react-markdown'],
        esmExternals: true,
        include: [
          /style-to-js/,
          /debug/,
          /extend/,
          /node_modules/,
          /secure-json-parse/,
          /classnames/
        ]
      }),
      dts({
        include: ['src'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        outDir: isReactBuild ? 'dist/types/react' : 'dist/types',
        rollupTypes: true,
        insertTypesEntry: true,
      }),
      {
        name: 'empty-css',
        enforce: 'pre',
        load(id) {
          if (id.endsWith('.css') && !id.endsWith('.tsx') && !id.endsWith('.ts') && !id.endsWith('.js')) {
            return 'export default "";';
          }
          return null;
        }
      },
      {
        name: 'disable-css-processing',
        configResolved(config) {
          const cssPlugin = config.plugins.find(p => p.name === 'vite:css');
          if (cssPlugin) {
            const originalTransform = cssPlugin.transform;
            cssPlugin.transform = (code, id) => {
              if (id.endsWith('.css') && !id.endsWith('.tsx') && !id.endsWith('.ts') && !id.endsWith('.js')) {
                return { code: 'export default "";' };
              }
              return null;
            };
          }
        }
      },
      {
        name: 'fix-typescript-errors',
        transform(code: string, id: string) {
          if (id.endsWith('util.ts')) {
            return code.replace(
              'return fn.apply(this, args);',
              'return fn.apply(this as any, args);'
            );
          }
          return null;
        }
      },      
    ].filter(Boolean),
    server: {
      port: 5173,
      open: true,
      host: true,
      hmr: true,
      fs: {
        allow: ['.']
      }
    },
    root: '.',
    publicDir: 'public',
    assetsInclude: ['**/*.css'],
  } as UserConfig;

  return config;
});
