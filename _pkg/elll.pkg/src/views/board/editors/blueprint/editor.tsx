// import { combineLatestOrEmpty, useObservable } from "@repo/utils";
// import React, { useMemo } from "react";
// import ReactFlow, { NodeChange, NodeProps } from "reactflow";
// import { map, switchMap } from "rxjs";
// import { BlueprintContext } from "./_context";
// import { ViewNode } from "./nodes/view_node";

// const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {
//   view: ViewNode,
// };

// function useNodes(blueprint: Blueprint) {
//   const [_views$, _views] = useMemo(() => {
//     const views$ = blueprint.views$.pipe(
//       switchMap((views) =>
//         combineLatestOrEmpty(
//           views.map((view) =>
//             blueprint.board
//               .node$(view.id)
//               .pipe(map((node) => ({ node, view }))),
//           ),
//         ),
//       ),
//     );
//     const views = blueprint.views.map((view) => ({
//       view,
//       node: blueprint.board.node(view.id),
//     }));

//     return [views$, views];
//   }, [blueprint]);

//   const views = useObservable(_views$, _views);

//   return views.map(({ view, node }) => ({
//     id: view.id,
//     type: "view",
//     position: {
//       x: node?.x ?? 0,
//       y: node?.y ?? 0,
//     },
//     data: view,
//   }));
// }

// export const BlueprintEditor = ({ blueprint }: { blueprint: Blueprint }) => {
//   const nodes = useNodes(blueprint);

//   const addView = () => {
//     const newView = new View();
//     blueprint.addView(newView);
//   };

//   const handleNodesChange = (changes: NodeChange[]) => {
//     for (const change of changes) {
//       switch (change.type) {
//         case "position": {
//           let update: Partial<NodeData> = {};
//           if (change.position) {
//             update.x = change.position.x;
//             update.y = change.position.y;
//           }
//           blueprint.board.updateNode(change.id, update);
//         }
//       }
//     }
//   };

//   return (
//     <BlueprintContext.Provider value={blueprint}>
//       <div style={{ height: "100vh", pointerEvents: "auto" }}>
//         <button
//           style={{ position: "absolute", zIndex: 10, top: 10, left: 10 }}
//           onClick={addView}
//         >
//           Add View
//         </button>
//         <ReactFlow
//           nodes={nodes}
//           edges={[]}
//           nodeTypes={nodeTypes}
//           onNodesChange={handleNodesChange}
//           fitView
//           proOptions={{
//             hideAttribution: true,
//           }}
//         />
//       </div>
//     </BlueprintContext.Provider>
//   );
// };
