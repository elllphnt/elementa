import { ChangeEventHandler, FocusEventHandler, ReactNode } from "react";

export function RawTextFieldControl({
  value,
  isMixed,
  isUndefined,
  onChange,
  onFocus,
  onBlur,
  suffix,
  onKeyDown,
  placeholder,
  autofocus,
}: {
  value?: string | number;
  isMixed?: boolean;
  isUndefined?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  suffix?: ReactNode;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  autofocus?: boolean;
}) {
  return (
    <>
      <div
        className="el-border el-h-7 el-rounded-md el-w-full"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: 5,
        }}
      >
        <input
          className="el-w-full"
          style={{
            width: "100%",
            outline: "none",
          }}
          value={value}
          placeholder={isMixed ? "mixed" : isUndefined ? "unset" : placeholder}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          autoFocus={autofocus}
        />

        {suffix ? (
          <div
            className="el-text-fg-400"
            style={{
              flexShrink: 0,
            }}
          >
            {suffix}
          </div>
        ) : null}
      </div>
    </>
  );
}
