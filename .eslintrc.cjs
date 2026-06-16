module.exports = {
  root: true,
  ignorePatterns: ["dist", "node_modules", "webview-ui/dist", "**/*.d.ts"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  overrides: [
    {
      files: ["src/**/*.ts"],
      env: {
        node: true,
        es2021: true
      }
    },
    {
      files: ["webview-ui/src/**/*.{ts,tsx}"],
      env: {
        browser: true,
        es2021: true
      }
    },
    {
      files: ["**/__tests__/**/*.ts"],
      env: {
        jest: true,
        node: true
      }
    }
  ]
};
