import cx from "classnames";

export function ProgressCircle({
  strokeWidth = 1.2,
  inline,
  className,
  style,
  size,
}: {
  strokeWidth?: number;
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}): JSX.Element {
  const radius = 50 - 4 * strokeWidth; // Centered radius based on a fixed viewBox

  return (
    <svg
      className={cx("progress-circle", className, {
        inline,
      })}
      style={{
        ...style,
        fontSize: size,
      }}
      width="1em"
      height="1em"
      viewBox="0 0 100 100" // Fixed coordinate system
    >
      {/* Full Circle (Background) */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke" /* Prevent stroke from scaling */
        opacity="0.2" /* Light background */
      />
      {/* Rotating Fraction */}
      <circle
        className="progress-circle-value"
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke" /* Prevent stroke from scaling */
        strokeDasharray="1em 3em"
        strokeLinecap="round" /* Rounded edges */
      />
    </svg>
  );
}

export default ProgressCircle;
