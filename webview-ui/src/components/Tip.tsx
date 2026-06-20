type TipProps = { text: string };

export function Tip({ text }: TipProps): JSX.Element {
  return (
    <span className="help-tip" title={text} aria-label={text}>
      ?
    </span>
  );
}
