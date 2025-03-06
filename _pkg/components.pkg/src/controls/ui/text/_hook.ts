import {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { mixed, MixedType } from "../../_utils/mixed";

export function useTextFieldControl({
  value,
  onChange,
}: {
  value?: string | MixedType;
  onChange?: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState<string>(
    value === mixed ? "" : value ?? "",
  );
  const [isFocused, setIsFocused] = useState(false);

  // handle value change
  useEffect(() => {
    if (isFocused) {
      onChange?.(inputValue);
    }
  }, [inputValue]);

  // restore value when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value === mixed ? "" : ((value ?? "") as any));
    }
  }, [isFocused, value]);

  const handleChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback((event) => {
    const value = (
      event.currentTarget as HTMLInputElement | HTMLTextAreaElement
    ).value;
    setInputValue(value);
  }, []);
  const handleFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> =
    useCallback(() => {
      setIsFocused(true);
    }, []);
  const handleBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> =
    useCallback(() => {
      setIsFocused(false);
    }, []);

  return {
    inputValue,
    isFocused,
    isMixed: value === mixed,
    isUndefined: value === undefined,
    handleChange,
    handleFocus,
    handleBlur,
  };
}
