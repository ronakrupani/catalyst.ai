/** Placeholder at the real dimensions of the content it replaces. */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`ct-skeleton rounded-xs ${className}`} style={style} aria-hidden="true" />;
}
