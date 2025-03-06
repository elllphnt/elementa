import cx from "classnames";

export type IconBoxProps = {
  full?: boolean;
} & JSX.IntrinsicElements["div"];

export function IconBox({
  className,
  full,
  ...props
}: IconBoxProps): JSX.Element {
  return (
    <div
      className={cx(
        "flex el-items-center el-justify-center el-text-fg-500",
        {
          "el-h-full el-w-full": full,
          "el-h-5 el-w-5": !full,
        },
        className,
      )}
      {...props}
    />
  );
}

export default IconBox;
