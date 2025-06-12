import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  const isReactBuild = mode === 'react';
 
  const config: UserConfig = {
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
      },
      dedupe: ['react', 'react-dom'],
      mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
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
        fileName: (format: string) =>
          `entelligence-chat${isReactBuild ? '-react' : ''}.${format}.js`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            '@emotion/react': 'emotionReact',
            '@emotion/styled': 'emotionStyled'
          },
          interop: 'auto'
        }
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        defaultIsModuleExports: true,
        requireReturnsDefault: true,
        esmExternals: true
      }
    },
    css: {
      postcss: false,
      modules: false,
      preprocessorOptions: {},
    },    
    plugins: [
      cssInjectedByJsPlugin({
        topExecutionPriority: true,
        processRelativeUrls: true,
        injectCode: (cssText) => {
          return fs.readFileSync('dist/vanilla/style.css', 'utf-8');
        }
      }),
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
      }),
      commonjs({
        requireReturnsDefault: true,
        transformMixedEsModules: true,
        esmExternals: true,
        include: [
          /node_modules/,
          /@assistant-ui/,
        ]
      }),
      dts({
        include: ['src'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        rollupTypes: true,
        insertTypesEntry: true,
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*']
          }
        },
      }),
      {
        name: 'empty-css',
        enforce: 'pre',
        load(id: string) {
          if (id.endsWith('.css') && !id.endsWith('.tsx') && !id.endsWith('.ts') && !id.endsWith('.js')) {
            return 'export default {}';
          }
          return null;
        }
      },
      {
        name: 'disable-css-processing',
        configResolved(resolvedConfig: UserConfig) {
          const cssPlugin = resolvedConfig.plugins?.find((p: any) => p.name === 'vite:css');
          if (cssPlugin) {
            cssPlugin.transform = (code: string, id: string) => {
              if (id.endsWith('.css') && !id.endsWith('.tsx') && !id.endsWith('.ts') && !id.endsWith('.js')) {
                return { code: 'export default {}' };
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
    optimizeDeps: {
      include: [
        '@assistant-ui/react',
        'react',
        'react-dom',
        'react/jsx-runtime'
      ],
      esbuildOptions: {
        target: 'es2020',
      },
    },
  };

  return config;
});
