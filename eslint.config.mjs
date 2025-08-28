// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), {
  rules: {
    // React and TypeScript optimizations
    "@typescript-eslint/no-unused-vars": ["error", { 
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error",
    
    // React 19 optimizations
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "warn",
    "react-hooks/exhaustive-deps": "warn",
    
    // Import organization
    "import/order": ["error", {
      groups: [
        "builtin",
        "external", 
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always",
      alphabetize: { order: "asc" }
    }],
    
    // Code quality
    "prefer-const": "error",
    "no-console": "warn",
    "no-debugger": "error",
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
