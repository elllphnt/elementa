import cx from "classnames";
import { ReactNode, forwardRef, useState } from "react";
import Icon from "~/src/icons/icon";
import ProgressBar from "~/src/loaders/progress_bar";
import { ColorAccent } from "../../_";

export const ControlButton = forwardRef<
  HTMLButtonElement,
  {
    loading?: boolean;
    label?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    dimmed?: boolean;
    align?: "start" | "center" | "end";
    accent?: ColorAccent;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    action?: {
      icon: string;
      label: string;
      handler: () => void;
    };
  }
>(function (
  {
    loading,
    label,
    prefix,
    suffix,
    onClick,
    align = "start",
    dimmed,
    accent,
    action,
  },
  ref,
) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      ref={ref}
      className={cx("el-border el-w-full el-h-7 el-rounded-md", {
        "el-text-fg-500": dimmed,
        "hover:el-bg-bg-200/20": !accent,
        "el-border-yellow/20 el-bg-yellow/10 hover:el-bg-yellow/20":
          accent === "yellow",
        "el-border-green/20 el-bg-green/10 hover:el-bg-green/20":
          accent === "green",
        "el-border-blue/20 el-bg-blue/10 hover:el-bg-blue/20":
          accent === "blue",
        "el-border-red/20 el-bg-red/10 hover:el-bg-red/20": accent === "red",
        "el-border-violet/20 el-bg-violet/10 hover:el-bg-violet/20":
          accent === "violet",
        "el-border-pm/20 el-bg-pm/10 hover:el-bg-pm/20": accent === "primary",
      })}
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        justifyContent: "space-between",
        cursor: "pointer",
        overflow: "hidden",
        gap: 4,
        textAlign: align,
        paddingLeft: prefix ? 4 : 8,
        paddingRight: suffix || action ? 4 : 8,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {prefix ? (
        <div
          className="el-h-5 el-w-5"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {prefix}
        </div>
      ) : (
        <></>
      )}
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
          textWrap: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      {suffix ? (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {suffix}
        </div>
      ) : action && hovered ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            action.handler();
          }}
          className={cx(
            "el-cursor-pointer el-h-5 el-w-5 el-rounded el-shrink-0 el-items-center el-opacity-50 hover:el-opacity-100 el-justify-center el-flex hover:el-bg-fg/10 el-border",
          )}
        >
          <Icon name={action.icon} className="el-h-4 el-w-4" />
        </div>
      ) : (
        <></>
      )}

      {loading ? (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <ProgressBar height={1} />
        </div>
      ) : (
        <></>
      )}
    </button>
  );
});
