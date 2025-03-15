// import {
//   DragDropContext,
//   Draggable,
//   Droppable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { useObservable } from "@repo/utils";
// import { useState } from "react";
// import { ProgrammingInterfaceEditorState } from "~/src/editors/programming_interface";

// export function ProgrammingInterfaceBoardView({
//   editor,
// }: {
//   editor: ProgrammingInterfaceEditorState;
// }): JSX.Element {
//   const pi = editor.programmingInterface;
//   const domains = useObservable(pi.domains$, pi.domains);

//   function handleDragEnd(result: DropResult) {
//     if (!result.destination) return;
//     const { source, destination, type } = result;

//     if (type === "domain") {
//       const reordered = Array.from(domains);
//       const [moved] = reordered.splice(source.index, 1);
//       reordered.splice(destination.index, 0, moved);
//       pi.moveDomain(result.draggableId, destination.index);
//     } else if (type === "query") {
//       pi.moveQuery(result.draggableId, source.droppableId, [
//         destination.droppableId,
//         destination.index,
//       ]);
//     } else if (type === "command") {
//       pi.moveCommand(result.draggableId, source.droppableId, [
//         destination.droppableId,
//         destination.index,
//       ]);
//     }
//   }

//   return (
//     <DragDropContext onDragEnd={handleDragEnd}>
//       <div
//         className="el-h-full el-overflow-auto el-p-4 el-space-y-4"
//         style={{
//           pointerEvents: "auto",
//         }}
//       >
//         <Droppable droppableId="domains" type="domain" direction="vertical">
//           {(provided) => (
//             <div ref={provided.innerRef} {...provided.droppableProps}>
//               {domains.map((domain, index) => (
//                 <Draggable
//                   key={domain.id}
//                   draggableId={domain.id}
//                   index={index}
//                 >
//                   {(provided) => (
//                     <div
//                       className="el-rounded el-bg-bg-100 el-p-2 el-mb-2"
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                     >
//                       <div
//                         className="el-flex el-justify-between el-items-center"
//                         {...provided.dragHandleProps}
//                       >
//                         <span>{domain.name || "Unnamed Domain"}</span>
//                         <button
//                           onClick={() => pi.removeDomain(domain.id)}
//                           className="el-bg-red-500 el-text-white el-rounded el-px-2"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                       <Droppable
//                         droppableId={domain.id}
//                         type="query"
//                         direction="vertical"
//                       >
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.droppableProps}
//                             className="el-my-2"
//                           >
//                             <p className="el-font-semibold">Queries</p>
//                             {pi.queriesByDomain(domain.id).map((q, i) => (
//                               <Draggable
//                                 key={q.id}
//                                 draggableId={q.id}
//                                 index={i}
//                               >
//                                 {(provided) => (
//                                   <div
//                                     className="el-p-1 el-rounded el-bg-bg-200/20 el-my-1"
//                                     ref={provided.innerRef}
//                                     {...provided.draggableProps}
//                                     {...provided.dragHandleProps}
//                                   >
//                                     {q.name}
//                                   </div>
//                                 )}
//                               </Draggable>
//                             ))}
//                             {provided.placeholder}
//                             <AddQuery domainId={domain.id} pi={pi} />
//                           </div>
//                         )}
//                       </Droppable>
//                       <Droppable
//                         droppableId={domain.id}
//                         type="command"
//                         direction="vertical"
//                       >
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.droppableProps}
//                             className="el-my-2"
//                           >
//                             <p className="el-font-semibold">Commands</p>
//                             {pi.commandsByDomain(domain.id).map((c, i) => (
//                               <Draggable
//                                 key={c.id}
//                                 draggableId={c.id}
//                                 index={i}
//                               >
//                                 {(provided) => (
//                                   <div
//                                     className="el-p-1 el-rounded el-bg-bg-200/20 el-my-1"
//                                     ref={provided.innerRef}
//                                     {...provided.draggableProps}
//                                     {...provided.dragHandleProps}
//                                   >
//                                     {c.name}
//                                   </div>
//                                 )}
//                               </Draggable>
//                             ))}
//                             {provided.placeholder}
//                             <AddCommand domainId={domain.id} pi={pi} />
//                           </div>
//                         )}
//                       </Droppable>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//               <AddDomain pi={pi} />
//             </div>
//           )}
//         </Droppable>
//       </div>
//     </DragDropContext>
//   );
// }

// function AddDomain({ pi }: { pi: ProgrammingInterface }) {
//   const [input, setInput] = useState("");
//   return (
//     <div className="el-mt-4">
//       <input
//         type="text"
//         onChange={(e) => setInput(e.target.value)}
//         value={input}
//         className="el-border el-rounded el-mr-2"
//         placeholder="Domain name"
//       />
//       <button
//         onClick={() => {
//           if (input.trim()) {
//             pi.addDomain({ name: input.trim() });
//             setInput("");
//           }
//         }}
//         className="el-bg-fg/5 el-rounded el-px-2"
//       >
//         Add Domain
//       </button>
//     </div>
//   );
// }

// function AddQuery({
//   domainId,
//   pi,
// }: {
//   domainId: string;
//   pi: ProgrammingInterface;
// }) {
//   const [input, setInput] = useState("");
//   return (
//     <div className="el-my-2">
//       <input
//         type="text"
//         onChange={(e) => setInput(e.target.value)}
//         value={input}
//         placeholder="Query name"
//         className="el-border el-rounded el-mr-2"
//       />
//       <button
//         onClick={() => {
//           if (input.trim()) {
//             pi.addQuery({ name: input.trim(), description: "" }, domainId);
//             setInput("");
//           }
//         }}
//         className="el-bg-fg/5 el-rounded el-px-2"
//       >
//         Add Query
//       </button>
//     </div>
//   );
// }

// function AddCommand({ domainId, pi }: { domainId: string; pi: any }) {
//   const [input, setInput] = useState("");
//   return (
//     <div className="el-my-2">
//       <input
//         type="text"
//         onChange={(e) => setInput(e.target.value)}
//         value={input}
//         placeholder="Command name"
//         className="el-border el-rounded el-mr-2"
//       />
//       <button
//         onClick={() => {
//           if (input.trim()) {
//             pi.addCommand({ name: input.trim(), description: "" }, domainId);
//             setInput("");
//           }
//         }}
//         className="el-bg-fg/5 el-rounded el-px-2"
//       >
//         Add Command
//       </button>
//     </div>
//   );
// }

export function ProgrammingInterfaceBoardView() {
  return <>ProgrammingInterfaceBoardView</>;
}
