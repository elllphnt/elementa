import { Droppable } from "@hello-pangea/dnd";
import { FeatureList } from "./feature_list";

export function DefaultContainer({ features }: { features: Feature[] }) {
  return (
    <Droppable
      droppableId={Spec.defaultDomainKey}
      direction="vertical"
      type="feature"
    >
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          <FeatureList features={features} />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
