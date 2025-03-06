import { mixed, MixedType } from "@repo/components";
import { useObservable } from "@repo/utils";
import { Observable } from "rxjs";

export function ColorMenu({
  value,
  value$,
  onChange,
}: {
  value?: string | MixedType | undefined;
  value$?: Observable<string | MixedType | undefined>;
  onChange?: (expression: string) => void;
}) {
  const currentValue = useObservable(value$, value);

  const color = currentValue === mixed ? "#fff0" : currentValue;

  return (
    <>Color</>
    // <InlineColorControl
    //   value={color}
    //   onChange={(color) => {
    //     onChange?.(color);
    //   }}
    // />
  );
}
