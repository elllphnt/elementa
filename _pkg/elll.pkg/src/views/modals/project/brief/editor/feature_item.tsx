export function FeatureItem({ feature }: { feature: any }) {
  // const state = useObservable(feature.state$, feature.state);
  // const project = useElllProject();
  // return (
  //   <div className="el-group el-space-y-3 el-bg-bg-100 el-p-3 el-rounded-md el-border">
  //     <div className="el-space-y-2">
  //       <div className="el-flex el-items-center el-justify-between">
  //         <h2 className="el-font-semibold">{state.name}</h2>

  //         <div className="el-flex el-gap-2 el-invisible group-hover:el-visible">
  //           <IconButton
  //             icon={elllIcons16.cross}
  //             onClick={() => {
  //               project.spec.removeFeature(feature.id);
  //             }}
  //           />
  //         </div>
  //       </div>
  //       <p className="el-text-fg-400">{state.description}</p>
  //     </div>
  //     <div>
  //       <button
  //         className="el-text-sm el-bg-fg/5 el-text-fg-400 hover:el-bg-fg/10 hover:el-text-fg-500 el-rounded el-px-1.5 el-py-0.5"
  //         disabled={state.planning}
  //         onClick={() => {
  //           project.blueprint.planFeature(feature.id);
  //         }}
  //       >
  //         {state.planning ? (
  //           <>
  //             <ProgressCircle inline /> Planning...
  //           </>
  //         ) : (
  //           "Plan"
  //         )}
  //       </button>
  //     </div>
  //   </div>
  // );

  return <>FeatureItem</>;
}
