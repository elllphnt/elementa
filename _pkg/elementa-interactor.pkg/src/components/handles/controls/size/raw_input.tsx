import { useEffect, useState } from "react";
import { AutoSizeInput } from "~/src/components/autosize_input";

export function RawSizeInput({
  value,
  onChange,
  isOwn,
  isExpression,
  isVarRef,
  isMixed,
}: {
  value?: string;
  onChange?: (value: string) => void;
  isOwn?: boolean;
  isExpression?: boolean;
  isVarRef?: boolean;
  isMixed?: boolean;
}) {
  const [inputValue, setInputValue] = useState(isOwn ? value || "" : "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(isOwn ? value || "" : "");
    }
  }, [value, isEditing]);

  let placeholder = value || "unset";
  if (isMixed) {
    placeholder = "mixed";
  }
  if (isExpression) {
    placeholder = "exp.";
  }
  if (isVarRef) {
    placeholder = "var.";
  }

  return (
    <AutoSizeInput
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      style={{
        background: "none",
        outline: "none",
        border: "none",
        color: "inherit",
        font: "inherit",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        maxWidth: "100%",
        padding: 0,
        textAlign: "center",
      }}
      placeholder={placeholder}
      inputProps={{
        onBlur: () => {
          setIsEditing(false);
          onChange?.(inputValue);
        },
        onFocus: () => {
          setIsEditing(true);
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        },
      }}
    />
  );
}
