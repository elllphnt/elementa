import clsx from "clsx";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) => {
  const baseClasses =
    "font-medium rounded-lg focus:ring-4 focus:outline-none transition-colors";

  const variantClasses = {
    primary: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300",
    secondary:
      "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200",
    danger: "text-white bg-red-700 hover:bg-red-800 focus:ring-red-300",
    success: "text-white bg-green-700 hover:bg-green-800 focus:ring-green-300",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          "opacity-50 cursor-not-allowed": disabled,
        },
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
