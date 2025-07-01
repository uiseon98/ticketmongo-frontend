import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
// --- Prettier 통합을 위한 추가 ---
import prettierConfig from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      // --- Prettier 플러그인 추가 ---
      prettier: pluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // --- Prettier 규칙 추가 (새로 추가) ---
      // Prettier 규칙에 어긋나면 에러 발생
      "prettier/prettier": "error",
    },
  },
  // --- Prettier config를 extends에 마지막으로 추가 (다른 규칙들을 덮어쓰지 않도록) ---
  prettierConfig,
];
