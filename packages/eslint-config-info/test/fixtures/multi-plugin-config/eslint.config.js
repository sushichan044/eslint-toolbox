import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default [
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "no-console": "warn",
      "no-unused-vars": "error",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
];
