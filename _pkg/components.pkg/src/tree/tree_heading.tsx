import cx from "classnames";
import React, { PropsWithChildren, forwardRef, useState } from "react";
import { elllIcons16 } from "../icons/elll_icons";
import Icon from "../icons/icon";
import ProgressBar from "../loaders/progress_bar";
import { TreeEntryRaw } from "./tree_entry_raw";

export type TreeHeadingProps = PropsWithChildren<{
  depth?: number;
  icon?: React.ReactNode;
  noIcon?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  active?: boolean;
  hover?: boolean;
  loading?: boolean;
  hoverable?: boolean;
  square?: boolean;
  size?: "small" | "medium" | "large";
  accent?: boolean;
  open?: boolean;
  nested?: boolean;
  container?: boolean;
  actions?: Array<{
    icon: React.ReactNode;
    handler?: (event: React.MouseEvent) => void;
  }>;
  onToggleOpen?: (open: boolean) => void;
}> &
  Omit<JSX.IntrinsicElements["div"], "ref" | "prefix">;
export const TreeHeading = forwardRef<HTMLDivElement, TreeHeadingProps>(
  function TreeHeading(
    {
      hoverable = true,
      depth = 0,
      icon,
      noIcon,
      prefix,
      suffix,
      children,
      className,
      active,
      hover,
      loading,
      square,
      size = "medium",
      accent,
      open,
      nested,
      container,
      actions = [],
      onToggleOpen,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) {
    const [isHovered, setHovered] = useState(false);

    return (
      <TreeEntryRaw
        ref={ref}
        className={cx(
          "el-h-7 el-relative el-w-full el-shrink-0 el-grow-0 el-flex el-items-center el-text-fg-300 el-text-start el-overflow-hidden el-cursor-pointer el-uppercase el-text-xs el-font-semibold",
          className,
        )}
        style={{
          gap: 4,
          letterSpacing: 0.75,
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        {...props}
      >
        {/* prefix */}
        <div className="el-h-full el-shrink-0 grow-0 el-flex el-items-center el-justify-end">
          {nested ? (
            container ? (
              <button
                className="el-w-5 el-h-5 el-rounded hover:el-bg-fg/5 el-p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOpen?.(!open);
                }}
              >
                <Icon
                  className={cx("el-transition-transform", {
                    "el-rotate-90": open,
                  })}
                  name={elllIcons16.chevron}
                />
              </button>
            ) : (
              <div style={{ width: 20 }} />
            )
          ) : (
            prefix
          )}
        </div>
        {/* body */}
        <div
          style={{
            flexGrow: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 4,
            overflow: "hidden",
          }}
        >
          {/* icon */}
          {!noIcon && (
            <div
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                flexGrow: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>
          )}
          {/* label */}
          <div
            style={{
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {children}
          </div>
        </div>

        {/* suffix */}
        <div
          style={{
            height: "100%",
            flexShrink: 0,
            flexGrow: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 4,
            gap: 4,
          }}
        >
          {actions.map(({ icon, handler }, index) => (
            <button
              key={index}
              className="el-w-5 el-h-5 el-rounded hover:el-bg-fg/10 el-p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                handler?.(e);
              }}
            >
              {icon}
            </button>
          ))}
          {suffix}
        </div>

        {loading && (
          <div
            style={{
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
            }}
          >
            <ProgressBar />
          </div>
        )}
      </TreeEntryRaw>
    );
  },
);
