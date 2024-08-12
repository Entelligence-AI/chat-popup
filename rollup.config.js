import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";

export default [
    {
        input: 'src/index.tsx', // Entry point of your React app
        output: {
            file: 'dist/entelligence-chat.js', // Output file
            format: 'cjs', // Immediately-Invoked Function Expression format for embedding
            name: 'ReactApp', // Global variable name for the app
            inlineDynamicImports: true, // Embed dynamic imports
        },
        plugins: [
            resolve(), // Resolves node_modules dependencies
            commonjs(), // Converts CommonJS modules to ES6
            typescript(),
            json(),// Transpile TypeScript to JavaScript
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-react'], // Transpile React JSX
            }),
            postcss({
                config: {
                    path: "./postcss.config.js",
                },
                plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                ],
                extensions: [".css"],
                minimize: true,
                inject: {
                    insertAt: "top",
                },
            }),
            injectProcessEnv({
                NODE_ENV: 'production', // Inject NODE_ENV=production
            }),
            terser(), // Minify the output
        ],
    },
]
