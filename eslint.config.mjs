import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "**/dist/",
      "**/build/",
      "**/coverage/",
      "**/node_modules/",
      "**/*.js",
      "**/*.mjs",
    ],
  },

  // Base config for all TypeScript files
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
);
