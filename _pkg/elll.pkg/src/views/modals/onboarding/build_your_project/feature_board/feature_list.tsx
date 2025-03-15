import { Draggable } from "@hello-pangea/dnd";
import { FeatureItem } from "./feature_item";

export function FeatureList({ features }: { features: any[] }) {
  return (
    <>
      {features.map((feature, index) => (
        <Draggable index={index} key={feature.id} draggableId={feature.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="el-p-1"
            >
              <FeatureItem feature={feature} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
}
