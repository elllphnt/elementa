import { Icon, elllIcons16 } from "@repo/components";
import cx from "classnames";

export function StatusIndicator({
  status,
  button,
  onClick,
}: {
  status?: string;
  button?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}): JSX.Element {
  let buttonClassName = "";
  let icon: JSX.Element | null = null;
  if (status === "succeeded") {
    icon = (
      <Icon
        key="succeeded"
        className="el-text-green el-h-4 el-w-4 el-shrink-0"
        name={elllIcons16.play}
      />
    );
    buttonClassName = "hover:el-bg-green/20";
  }
  if (status === "failed") {
    icon = (
      <Icon
        key="failed"
        className="el-text-red/90 el-h-4 el-w-4 el-shrink-0"
        name={elllIcons16.cross}
      />
    );
    buttonClassName = "hover:el-bg-red/20";
  }
  if (status === "running") {
    icon = (
      <div
        key="running"
        className="el-bg-yellow/20 el-text-sm el-h-4 el-w-4 el-rounded-full el-flex el-items-center el-justify-center"
      >
        <div className="el-bg-yellow el-text-sm el-h-2 el-w-2 el-rounded-full el-flex el-items-center animate-pulse" />
      </div>
    );
    buttonClassName = "hover:el-bg-yellow/20";
  }
  if (status === "pending") {
    icon = (
      <div
        key="pending"
        className="el-bg-blue/20 el-text-sm el-h-4 el-w-4 el-rounded-full el-flex el-items-center el-justify-center"
      >
        <div className="el-bg-blue el-text-sm el-h-2 el-w-2 el-rounded-full el-flex el-items-center animate-pulse" />
      </div>
    );
    buttonClassName = "hover:el-bg-blue/20";
  }

  if (button) {
    return (
      <button
        className={cx(
          "el-flex el-items-center el-justify-center el-rounded el-h-5 el-w-5",
          buttonClassName,
        )}
        onClick={(e) => {
          e.stopPropagation(), onClick?.(e);
        }}
      >
        {icon}
      </button>
    );
  } else {
    return icon ?? <></>;
  }
}
