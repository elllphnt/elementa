import { useObservable } from "@repo/utils";
import { useNamespace } from "../../hooks/namespace";
import { SwitchTransformer } from "@repo/elementa-models";

export function SwitchTransformerComponent({
  transformer,
}: {
  transformer: SwitchTransformer;
}) {
  const value = useObservable(transformer.value$, transformer.value);
  const cases = useObservable(transformer.cases$, transformer.cases);
  const _default = useObservable(transformer.default$, transformer.default);
  const namespace = useNamespace();

  const valueValue = namespace.resolveValue(value);
  const casesValue = cases.map((c) => ({
    fragment: namespace.resolveValue(c.fragment),
    value: namespace.resolveValue(c.value),
  }));
  const defaultValue = namespace.resolveValue(_default);

  let fragmentValue = defaultValue;

  for (const c of casesValue) {
    if (c.value === valueValue) {
      fragmentValue = c.fragment;
      break;
    }
  }

  if (fragmentValue) {
    return <>{fragmentValue}</>;
  } else {
    return <></>;
  }
}
