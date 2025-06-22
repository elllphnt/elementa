import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import React, { type JSX, type PropsWithChildren, useState } from "react";
import { TreeEntryRaw } from "./tree_entry_raw";

export type TreeEntryProps = PropsWithChildren<{
  ref?: React.Ref<HTMLDivElement>; // <- ✅ direct ref as prop
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
  contentClassname?: string;
}> &
  Omit<JSX.IntrinsicElements["div"], "ref" | "prefix">;

export function TreeEntry({
  ref,
  hoverable = true,
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
  contentClassname,
  ...props
}: TreeEntryProps) {
  const [isHovered, setHovered] = useState(false);

  return (
    <TreeEntryRaw
      ref={ref}
      className={clsx(
        "relative w-full shrink-0 grow-0 flex items-center text-fg-400 text-start overflow-hidden outline outline-1 -outline-offset-1 cursor-pointer",
        {
          "outline-transparent": !active,
          "hover:bg-fg/5": !active && !hover && hoverable && !accent,
          "bg-fg/5 hover:bg-fg/10 text-fg-500 outline-fg/10": active && !accent,
          "bg-fg/5": hover && hoverable && !accent,
          "hover:bg-pm/20": !active && !hover && hoverable && accent,
          "bg-pm/10 hover:bg-pm/20 text-fg-500 outline-pm/30": active && accent,
          "bg-pm/10 hover:bg-pm/10": hover && hoverable && accent,
          "rounded": !square,
          "h-7": size === "medium",
          "h-6": size === "small",
        },
        className
      )}
      style={{ gap: 4 }}
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
                className={clsx("h-4 w-4 transition-transform", {
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
        <div
          className={contentClassname}
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
        {isHovered &&
          actions.map(({ icon, handler }, index) => (
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
      </div>
    </TreeEntryRaw>
  );
}
