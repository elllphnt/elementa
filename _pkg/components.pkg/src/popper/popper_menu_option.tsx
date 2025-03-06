import cx from "classnames";

export type PopperMenuOptionProps = {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  dimmed?: boolean;
  disabled?: boolean;
};

export function PopperMenuOption({
  label,
  icon,
  onClick,
  dimmed = false,
  disabled = false,
}: PopperMenuOptionProps) {
  return (
    <div
      className={cx(
        "el-py-1 el-w-full el-rounded-sm el-text-sm el-flex el-items-center el-gap-1",
        {
          "el-text-fg-500": dimmed || disabled,
          "hover:el-bg-bg-200/50": !disabled,
          "el-px-2": !icon,
          "el-pl-1 el-pr-2": icon,
        },
      )}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        textWrap: "nowrap",
        textOverflow: "ellipsis",
      }}
      onClick={
        disabled
          ? undefined
          : (e) => {
              e.stopPropagation();
              e.preventDefault();
              onClick(e);
            }
      }
    >
      {icon}
      <div>{label}</div>
    </div>
  );
}
