export function ProgressBar({ height = 2 }: { height?: number }): JSX.Element {
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-bar-value"></div>
    </div>
  );
}

export default ProgressBar;
