import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useObservable } from "@repo/utils";
import { SpecContext } from "./_context";
import { DefaultDomainColumn, DomainColumn } from "./domain";

export function FeaturesEditorView({ spec }: { spec: Spec }): JSX.Element {
  const domains = useObservable(spec.domains$, spec.domains);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }

    const { source, destination, type } = result;

    if (type === "domain") {
      const reorderedDomains = Array.from(domains);
      const [movedDomain] = reorderedDomains.splice(source.index, 1);
      reorderedDomains.splice(destination.index, 0, movedDomain);
      spec.setDomains(reorderedDomains);
    } else if (type === "feature") {
      const sourceDomainId = source.droppableId;
      const destinationDomainId = destination.droppableId;
      const destinationIndex = destination.index;
      spec.moveFeature(result.draggableId, sourceDomainId, [
        destinationDomainId,
        destinationIndex,
      ]);
    }
  }

  return (
    <SpecContext.Provider value={spec}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className="el-p-2 el-flex no-scrollbar"
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
            overflowX: "auto",
          }}
        >
          <Droppable type="domain" droppableId="domains" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className="el-flex"
                {...provided.droppableProps}
              >
                {domains.map((domain, index) => (
                  <Draggable
                    key={domain.id}
                    draggableId={domain?.id || `${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="el-p-1"
                      >
                        <DomainColumn
                          domain={domain}
                          solid={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <div className="el-p-1">
            <DefaultDomainColumn />
          </div>
        </div>
      </DragDropContext>
    </SpecContext.Provider>
  );
}
