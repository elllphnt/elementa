export function FeatureBoard({
  onAddFeature,
  addingFeature,
}: {
  addingFeature?: boolean;
  onAddFeature?: () => void;
}) {
  // const project = useElllProject();
  // const spec = project.spec;
  // const domains = useObservable(spec.domains$, spec.domains);
  // const unassignedFeatures = useObservable(
  //   spec.featuresByDomain$(),
  //   spec.featuresByDomain(),
  // );

  // if (!domains.length && !unassignedFeatures.length && !addingFeature) {
  //   return (
  //     <div className="el-h-full el-w-full el-p-4 el-pb-0">
  //       <div
  //         className="el-h-full el-w-full el-p-2 el-text-fg-400 el-flex el-flex-col el-items-center el-justify-center el-text-center el-gap-2 hover:el-bg-bg-200/50 el-transition-colors el-cursor-pointer el-rounded"
  //         onClick={onAddFeature}
  //       >
  //         <Icon name={elllIcons16.plus} className="el-h-4 el-w-4" />

  //         <p>Features define what your application can do.</p>
  //         <p>Click to create add a new feature to your project.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // function handleDragEnd(result: DropResult) {
  //   if (!result.destination) {
  //     return;
  //   }

  //   const { source, destination, type } = result;

  //   if (type === "domain") {
  //     const reorderedDomains = Array.from(domains);
  //     const [movedDomain] = reorderedDomains.splice(source.index, 1);
  //     reorderedDomains.splice(destination.index, 0, movedDomain);
  //     spec.setDomains(reorderedDomains);
  //   } else if (type === "feature") {
  //     const sourceDomainId = source.droppableId;
  //     const destinationDomainId = destination.droppableId;
  //     const destinationIndex = destination.index;
  //     spec.moveFeature(result.draggableId, sourceDomainId, [
  //       destinationDomainId,
  //       destinationIndex,
  //     ]);
  //   }
  // }

  // return (
  //   <DragDropContext onDragEnd={handleDragEnd}>
  //     <ScrollArea scrollY containerClassName="el-p-3">
  //       <Droppable droppableId="features" direction="vertical" type="domain">
  //         {(provided, snapshot) => (
  //           <div ref={provided.innerRef} {...provided.droppableProps}>
  //             {domains.map((domain, index) => (
  //               <Draggable
  //                 index={index}
  //                 key={domain.id}
  //                 draggableId={domain.id}
  //               >
  //                 {(provided, snapshot) => (
  //                   <div
  //                     ref={provided.innerRef}
  //                     {...provided.draggableProps}
  //                     {...provided.dragHandleProps}
  //                     className="el-pb-4"
  //                   >
  //                     <DomainContainer domain={domain} />
  //                   </div>
  //                 )}
  //               </Draggable>
  //             ))}

  //             {provided.placeholder}
  //           </div>
  //         )}
  //       </Droppable>

  //       {unassignedFeatures.length > 0 ? (
  //         <DefaultContainer features={unassignedFeatures} />
  //       ) : (
  //         <></>
  //       )}
  //     </ScrollArea>
  //   </DragDropContext>
  // );

  return <>FeatureBoard</>;
}
