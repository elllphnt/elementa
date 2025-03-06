import { useObservable } from "@repo/utils";
import { isArray } from "lodash";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";
import { MapTransformer } from "@repo/elementa-models";

function MapTransformerItemComponent({
  fragment,
  index,
  data,
}: {
  fragment: any;
  index: number;
  data: any;
}) {
  const namespace = useNamespace({ clone: true });
  namespace.set("$", data);
  namespace.set("$$", { index });

  return (
    <NamespaceContext.Provider value={namespace}>
      {/* {JSON.stringify(namespace.content.$)} */}
      {fragment}
    </NamespaceContext.Provider>
  );
}

export function MapTransformerComponent({
  transformer,
}: {
  transformer: MapTransformer;
}) {
  const source = useObservable(transformer.source$, transformer.source);
  const fragment = useObservable(
    transformer.fragmentId$,
    transformer.fragmentId,
  );
  const namespace = useNamespace();

  const sourceValue = namespace.resolveValue(source);
  const fragmentValue = namespace.resolveValue(fragment);

  if (isArray(sourceValue) && fragmentValue) {
    const fragments = [];
    for (let i = 0; i < sourceValue.length; i++) {
      fragments.push(
        <MapTransformerItemComponent
          key={i}
          fragment={fragmentValue}
          index={i}
          data={sourceValue[i]}
        />,
      );
    }
    return <>{fragments}</>;
  } else {
    return <></>;
  }
}
