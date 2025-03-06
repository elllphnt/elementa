import { useEffect, useState } from "react";

export function StatefulInput({
  value: initialValue,
  onChange,
  onBlur,
  onFocus,
  ...props
}: JSX.IntrinsicElements["input"]) {
  const [value, setValue] = useState(initialValue || "");
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue(value);
  };

  useEffect(() => {
    if (!focused) {
      setValue(initialValue || "");
    }
  }, [initialValue]);

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onChange?.(e);
        onBlur?.(e);
      }}
    />
  );
}

export default StatefulInput;
