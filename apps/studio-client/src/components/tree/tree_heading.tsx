import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import React, { type JSX, type PropsWithChildren, forwardRef } from "react";
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
      icon,
      noIcon,
      prefix,
      suffix,
      children,
      className,
      loading,
      open,
      nested,
      container,
      actions = [],
      onToggleOpen,
      ...props
    },
    ref
  ) {
    return (
      <TreeEntryRaw
        ref={ref}
        className={clsx(
          "h-7 relative w-full shrink-0 grow-0 flex items-center text-fg-300 text-start overflow-hidden cursor-pointer uppercase text-xs font-semibold",
          className
        )}
        style={{
          gap: 4,
          letterSpacing: 0.75,
        }}
        {...props}
      >
        {/* prefix */}
        <div className="h-full shrink-0 grow-0 flex items-center justify-end">
          {nested ? (
            container ? (
              <button
                className="w-5 h-5 rounded hover:bg-fg/5 p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOpen?.(!open);
                }}
              >
                <ChevronRight
                  className={clsx("transition-transform", {
                    "rotate-90": open,
                  })}
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
              className="w-5 h-5 rounded hover:bg-fg/10 p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                handler?.(e);
              }}
            >
              {icon}
            </button>
          ))}
          {suffix}
          {loading && (
            <div className="w-4 h-4 border-2 border-t-transparent border-fg/50 rounded-full animate-spin" />
          )}
        </div>
      </TreeEntryRaw>
    );
  }
);
