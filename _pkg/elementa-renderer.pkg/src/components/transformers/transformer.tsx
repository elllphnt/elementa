import { entityTypes } from "@elllphnt/elll-element";
import {
  ConditionalTransformer,
  MapTransformer,
  RepeatTransformer,
  SwitchTransformer,
  Transformer,
} from "@repo/elementa-models";
import { ConditionalTransformerComponent } from "./conditional";
import { MapTransformerComponent } from "./map";
import { RepeatTransformerComponent } from "./repeat";
import { SwitchTransformerComponent } from "./switch";

export function TransformerComponent({
  transformer,
}: {
  transformer: Transformer;
}): JSX.Element {
  switch (transformer.type) {
    case entityTypes.transformers.repeat:
      return (
        <RepeatTransformerComponent
          transformer={transformer as RepeatTransformer}
        />
      );
    case entityTypes.transformers.map:
      return (
        <MapTransformerComponent transformer={transformer as MapTransformer} />
      );
    case entityTypes.transformers.switch:
      return (
        <SwitchTransformerComponent
          transformer={transformer as SwitchTransformer}
        />
      );
    case entityTypes.transformers.conditional:
      return (
        <ConditionalTransformerComponent
          transformer={transformer as ConditionalTransformer}
        />
      );
    default:
      return <></>;
  }
}
