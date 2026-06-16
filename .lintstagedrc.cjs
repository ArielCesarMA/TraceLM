module.exports = {
  "src/**/*.{ts,tsx}": (files) => {
    const quotedFiles = files.map((file) => `"${file}"`).join(" ");

    return [`eslint --fix ${quotedFiles}`, "npm run typecheck"];
  },
  "webview-ui/src/**/*.{ts,tsx}": (files) => {
    const quotedFiles = files.map((file) => `"${file}"`).join(" ");

    return [`eslint --fix ${quotedFiles}`, "npm run typecheck:webview"];
  }
};
