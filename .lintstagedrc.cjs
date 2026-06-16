module.exports = {
  "src/**/*.{ts,tsx}": () => ["npm run typecheck"],
  "webview-ui/src/**/*.{ts,tsx}": () => ["npm run typecheck:webview"]
};
