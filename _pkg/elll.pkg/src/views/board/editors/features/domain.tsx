// import { Draggable, Droppable } from "@hello-pangea/dnd";
// import {
//   elllIcons16,
//   ProgressBar,
//   RawActionBar,
//   ScrollArea,
// } from "@repo/components";
// import { useObservable } from "@repo/utils";
// import cx from "classnames";
// import { useState } from "react";
// import { useEditorSpec } from "./_context";
// import { FeatureCard } from "./feature";

// function Title({ name }: { name?: string }): JSX.Element {
//   return <div>{name}</div>;
// }

// function FeatureList({ domainId }: { domainId?: string }): JSX.Element {
//   const spec = useEditorSpec();
//   const features = useObservable(
//     spec.featuresByDomain$(domainId),
//     spec.featuresByDomain(domainId),
//   );
//   return (
//     <Droppable
//       type="feature"
//       droppableId={domainId ?? Spec.defaultDomainKey}
//       direction="vertical"
//     >
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           className={cx("el-h-full el-w-full el-rounded", {
//             "el-bg-bg-200/20": snapshot.isDraggingOver,
//           })}
//           {...provided.droppableProps}
//         >
//           <ScrollArea scrollY containerClassName="el-p-1">
//             <div className="el-flex el-flex-col">
//               <div className="el-flex el-flex-col ">
//                 {features.map((feature, index) => (
//                   <Draggable
//                     key={feature.id}
//                     draggableId={feature.id}
//                     index={index}
//                   >
//                     {(provided, snapshot) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         {...provided.dragHandleProps}
//                         className="el-p-1"
//                         style={{
//                           width: "100%",
//                           ...provided.draggableProps.style,
//                         }}
//                       >
//                         <FeatureCard feature={feature} />
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             </div>
//           </ScrollArea>
//         </div>
//       )}
//     </Droppable>
//   );
// }

// function Header({ domain }: { domain: DomainData }): JSX.Element {
//   const spec = useEditorSpec();

//   return (
//     <div className="el-flex el-justify-between el-items-center">
//       <div className="el-font-semibold">{domain.name ?? "Untitled"}</div>
//       <RawActionBar
//         actions={[
//           {
//             key: "more",
//             title: "More",
//             icon: elllIcons16.plus,
//             options: [
//               {
//                 label: "Remove this domain",
//                 onClick: () => {
//                   spec.removeDomain(domain.id);
//                 },
//               },
//             ],
//           },
//         ]}
//       />
//     </div>
//   );
// }

// export function DomainColumn({
//   domain,
//   solid,
// }: {
//   domain: DomainData;
//   solid?: boolean;
// }): JSX.Element {
//   return (
//     <div
//       className={cx(
//         "el-h-full el-rounded hover:el-bg-bg-100 el-flex el-flex-col",
//         {
//           "el-bg-bg-100": solid,
//         },
//       )}
//       style={{
//         width: 240,
//         flexShrink: 0,
//       }}
//     >
//       <div className="el-p-2 ">
//         <Header domain={domain} />
//       </div>

//       <div className="el-grow el-overflow-hidden">
//         <FeatureList domainId={domain.id} />
//       </div>
//     </div>
//   );
// }

// export function DefaultDomainColumn(): JSX.Element {
//   return (
//     <div
//       className="el-h-full el-rounded el-flex el-flex-col"
//       style={{
//         width: 240,
//         flexShrink: 0,
//       }}
//     >
//       <div className="el-p-2 el-text-fg-300 el-space-y-2">
//         <p className="el-font-semibold">Global</p>
//         <p>Features without an assigned domain are placed here.</p>
//       </div>

//       <div className="el-grow el-overflow-hidden">
//         <ScrollArea scrollY containerClassName="el-p-1">
//           <FeatureList />
//         </ScrollArea>
//       </div>
//     </div>
//   );
// }

// export function AddColumn(): JSX.Element {
//   const spec = useEditorSpec();

//   const [input, setInput] = useState("");
//   const [isAdding, setIsAdding] = useState(false);

//   const handleAdd = () => {
//     const trimmed = input.trim();
//     if (!trimmed) {
//       return;
//     }

//     // spec.addDomain({
//     //   name: trimmed,
//     // });
//     setInput("");
//   };

//   return (
//     <div
//       className="el-h-full el-rounded el-flex el-flex-col"
//       style={{
//         width: 240,
//         flexShrink: 0,
//       }}
//     >
//       <div className="el-p-2 el-space-y-2">
//         <input
//           type="text"
//           className="el-w-full el-rounded el-border el-h-7 el-px-2"
//           placeholder="Domain name or description"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               handleAdd();
//             }
//           }}
//         />
//         <button
//           className="el-relative el-overflow-hidden el-w-full el-bg-fg/5 el-text-fg hover:el-bg-fg/10 el-rounded el-px-2 el-py-1"
//           onClick={handleAdd}
//         >
//           Add Domain
//           <div
//             style={{
//               position: "absolute",
//               bottom: 0,
//               left: 0,
//               right: 0,
//               opacity: isAdding ? 1 : 0,
//             }}
//           >
//             <ProgressBar height={1} />
//           </div>
//         </button>
//       </div>
//     </div>
//   );
// }
