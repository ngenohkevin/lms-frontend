/** @type {import('prettier').Config} */
export default {
  // Core formatting options
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // Line and indentation
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,

  // End of line handling (consistent across platforms)
  endOfLine: 'lf',

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // HTML whitespace handling
  htmlWhitespaceSensitivity: 'css',

  // Vue and other SFC formatting
  vueIndentScriptAndStyle: false,

  // Plugin configuration
  plugins: [
    'prettier-plugin-tailwindcss', // Must be last to ensure proper class sorting
  ],

  // Tailwind CSS plugin options
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva'],

  // File-specific overrides
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 120,
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 100,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        singleQuote: false,
        tabWidth: 2,
      },
    },
    {
      files: ['package.json'],
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
  ],
};
