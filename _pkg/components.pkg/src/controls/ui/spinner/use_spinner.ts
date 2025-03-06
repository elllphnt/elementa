import { useCallback, useEffect, useState } from "react";
import { mixed, MixedType } from "../../_utils/mixed";

export function useSpinnerControl({
  value,
  onChange,
  step = 1,
  min = -Infinity,
  max = Infinity,
  round,
}: {
  value?: number | MixedType | null;
  onChange?: (value: number | undefined) => void;
  step?: number;
  min?: number;
  max?: number;
  round?: number;
}) {
  const [inputValue, setInputValue] = useState<number | "">(
    value === mixed ? "" : (value ?? ""),
  );
  const [isFocused, setIsFocused] = useState(false);

  // handle value change
  useEffect(() => {
    if (isFocused) {
      const value = inputValue === "" ? undefined : Number(inputValue);
      if (Number.isNaN(value)) return;
      onChange?.(value);
    }
  }, [inputValue]);

  // restore value when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value === mixed ? "" : ((value ?? "") as any));
    }
  }, [isFocused, value]);

  const handleChange = useCallback((value: string) => {
    if (value === "") {
      setInputValue("");
      return;
    }

    let number = Number(value);
    if (Number.isNaN(number)) return;

    if (round) {
      number = Math.round(number * Math.pow(10, round)) / Math.pow(10, round);
    }

    const clamped = Math.min(Math.max(number, min), max);
    setInputValue(clamped);
  }, []);
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const increment = useCallback(() => {
    const value = Number(inputValue);
    if (Number.isNaN(value)) return;
    const clamped = Math.max(min, Math.min(max, value + step));
    onChange?.(clamped);
  }, [inputValue]);
  const decrement = useCallback(() => {
    const value = Number(inputValue);
    if (Number.isNaN(value)) return;
    const clamped = Math.max(min, Math.min(max, value - step));
    onChange?.(clamped);
  }, [inputValue]);

  const startLongPress = useCallback(
    (inc: number = step) => {
      const value = Number(inputValue);
      if (Number.isNaN(value)) return;
      let interval: any;
      const timeout = setTimeout(() => {
        let i = 0;
        interval = setInterval(() => {
          i += inc;
          const clamped = Math.max(min, Math.min(max, value + i));
          onChange?.(clamped);
        }, 100);
      }, 300);
      const handleMouseUp = () => {
        if (interval !== undefined) clearInterval(interval);
        clearTimeout(timeout);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mouseup", handleMouseUp);
    },
    [inputValue],
  );
  const startLongIncrement = useCallback(() => {
    startLongPress(step);
  }, [startLongPress]);
  const startLongDecrement = useCallback(() => {
    startLongPress(-step);
  }, [startLongPress]);

  return {
    inputValue,
    isFocused,
    isMixed: value === mixed,
    isUndefined: value === undefined,
    handleChange,
    handleFocus,
    handleBlur,
    increment,
    decrement,
    startLongIncrement,
    startLongDecrement,
  };
}
