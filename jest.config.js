module.exports = {
  projects: [
    // ── Extension host (Node.js) ──────────────────────────────────────────────
    {
      displayName: 'extension',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      testMatch: ['**/__tests__/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js'],
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
      },
    },

    // ── React Webview (jsdom) ─────────────────────────────────────────────────
    {
      displayName: 'webview',
      testEnvironment: 'jest-environment-jsdom',
      roots: ['<rootDir>/webview-ui/src'],
      testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
      moduleFileExtensions: ['tsx', 'ts', 'js'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/webview-ui/tsconfig.json' }],
      },
      moduleNameMapper: {
        // Route all React imports to the single copy inside webview-ui/node_modules
        // so @testing-library/react and the components use the exact same React instance.
        '^react$': '<rootDir>/webview-ui/node_modules/react',
        '^react/jsx-runtime$': '<rootDir>/webview-ui/node_modules/react/jsx-runtime',
        '^react-dom$': '<rootDir>/webview-ui/node_modules/react-dom',
        '^react-dom/client$': '<rootDir>/webview-ui/node_modules/react-dom/client',
        // Stub CSS imports
        '\\.(css|less|scss|sass)$': '<rootDir>/scripts/__mocks__/styleMock.cjs',
      },
    },
  ],

  // Coverage collected across both projects via `npm run test:coverage`
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'webview-ui/src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/extension.ts',
    '!webview-ui/src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
};
