import { memo, useCallback, useState } from 'react';

type Props = {
  text: string;
  title?: string;
};

export const CopyButton = memo(function CopyButton({ text, title = 'Copy' }: Props): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable in restricted webview contexts — silently ignore
    }
  }, [text]);

  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : title}
      aria-label={copied ? 'Copied!' : title}
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
});
