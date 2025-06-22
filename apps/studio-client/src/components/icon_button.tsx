import clsx from "clsx";
import type { ReactNode } from "react";

export function IconButton({
  onClick,
  disabled = false,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  icon: ReactNode;
  label?: string;
  active?: boolean;
}) {
  return (
    <button
      className={clsx(
        "rounded hover:bg-fg/5 flex items-center justify-center",
        label ? "h-7 px-2 gap-1.5" : "h-7 w-7",
        {
          "bg-fg/10": active,
          "cursor-not-allowed opacity-50": disabled,
          "hover:bg-fg/10": !disabled && !active,
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}
