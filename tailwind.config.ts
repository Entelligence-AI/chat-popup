export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    require("tailwindcss-animate"),
    require("@assistant-ui/react/tailwindcss"),
    require("@assistant-ui/react-markdown/tailwindcss"),
  ],
};
