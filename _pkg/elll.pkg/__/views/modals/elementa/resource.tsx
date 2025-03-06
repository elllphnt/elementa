import { useObservable } from "@repo/utils";
import { Observable } from "rxjs";

export function ResourceMenu({
  value,
  value$,
  onChange,
}: {
  value?: string | MixedType | undefined;
  value$?: Observable<string | MixedType | undefined>;
  onChange?: (source: string | undefined) => void;
}) {
  const currentValue = useObservable(value$, value);

  let script = currentValue ?? "";
  let placeholder = "Enter URL here";
  if (currentValue === mixed) {
    placeholder =
      "Mixed URL values. Enter a URL to override the existing values.";
  }

  return (
    <ScriptControl
      value={script}
      onChange={(script) => {
        if (script) {
          onChange?.(script);
        } else {
          onChange?.(undefined);
        }
      }}
      settings={{
        placeholder,
      }}
    />
  );
}
