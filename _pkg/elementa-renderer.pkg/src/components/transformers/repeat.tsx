import { useObservable } from "@repo/utils";
import React from "react";
import { useNamespace } from "../../hooks/namespace";
import { RepeatTransformer } from "@repo/elementa-models";

export function RepeatTransformerComponent({
  transformer,
}: {
  transformer: RepeatTransformer;
}) {
  const count = useObservable(transformer.count$, transformer.count);
  const fragment = useObservable(
    transformer.fragmentId$,
    transformer.fragmentId,
  );
  const namespace = useNamespace();

  const countValue = namespace.resolveValue(count);
  const fragmentValue = namespace.resolveValue(fragment);

  if (typeof countValue === "number" && fragmentValue) {
    const fragments = [];
    for (let i = 0; i < countValue; i++) {
      fragments.push(<React.Fragment key={i}>{fragmentValue}</React.Fragment>);
    }
    return <>{fragments}</>;
  } else {
    return <></>;
  }
}
