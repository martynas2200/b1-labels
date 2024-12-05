import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: globals.browser,
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": [
        "warn",
        {
          "singleQuote": true,
          "trailingComma": "all",
          "semi": false,
          "parser": "flow"
        }
      ],
      "semi": ["warn", "never"],
      "no-unused-vars": "warn",
      "no-extra-semi": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "curly": ["error", "all"],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn"
    },
  },
  ...tseslint.configs.recommended
];