import type { ChangeEventHandler } from "react";

export function AutoSizeInput({
  value,
  placeholder,
  onChange,
  style,
  inputProps,
  ...props
}: {
  value?: string;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  inputProps?: JSX.IntrinsicElements["input"];
} & Omit<JSX.IntrinsicElements["div"], "onChange">) {
  const { style: inputStyle, ..._inputProps } = inputProps ?? {};

  return (
    <div
      style={{
        position: "relative",
        height: "1.2em",
        ...style,
      }}
      {...props}
    >
      <span
        style={{
          opacity: 0,
        }}
      >
        {value || placeholder}
      </span>
      <input
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: 0,
          margin: 0,
          border: "none",
          outline: "none",
          background: "none",
          font: "inherit",
          color: "inherit",
          lineHeight: "inherit",
          ...inputStyle,
        }}
        {..._inputProps}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
}
