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
  rules: {
    // Flag any declared variable (including destructured props) that is never read.
    // Prefix with _ to suppress intentionally-unused params (e.g. _index in callbacks).
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ]
  },
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
      files: ["**/__tests__/**/*.{ts,tsx}"],
      env: {
        jest: true,
        node: true
      },
      rules: {
        // Test files legitimately import things only for side-effects or type assertions
        "@typescript-eslint/no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }]
      }
    }
  ]
};
