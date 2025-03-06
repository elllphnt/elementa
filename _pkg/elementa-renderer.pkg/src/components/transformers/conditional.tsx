import { useObservable } from "@repo/utils";
import { useNamespace } from "../../hooks/namespace";
import { ConditionalTransformer } from "@repo/elementa-models";

export function ConditionalTransformerComponent({
  transformer,
}: {
  transformer: ConditionalTransformer;
}) {
  const conditions = useObservable(
    transformer.conditions$,
    transformer.conditions,
  );
  const _default = useObservable(transformer.default$, transformer.default);
  const namespace = useNamespace();

  const conditionsValue = conditions.map((c) => ({
    fragment: namespace.resolveValue(c.fragment),
    condition: namespace.resolveValue(c.condition),
  }));
  const defaultValue = namespace.resolveValue(_default);

  let fragmentValue = defaultValue;

  for (const c of conditionsValue) {
    if (c.condition) {
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
