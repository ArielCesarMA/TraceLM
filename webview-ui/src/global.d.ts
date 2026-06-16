export {};

declare global {
  interface Window {
    __TRACELM_VSCODE__?: {
      postMessage: (message: unknown) => void;
    };
  }
}
