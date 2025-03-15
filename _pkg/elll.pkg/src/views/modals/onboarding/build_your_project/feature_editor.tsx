import TextArea from "react-textarea-autosize";

function AddFeatureControl({ onCompleted }: { onCompleted: () => void }) {
  return (
    <div className="el-w-full">
      <TextArea
        className="el-border el-rounded-md el-py-2 el-px-3"
        style={{
          width: "100%",
          background: "none",
          resize: "none",
          outline: "none",
          display: "block",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        placeholder="Add a feature"
        autoFocus
        onBlur={onCompleted}
      />
    </div>
  );
}

export function FeatureEditor() {
  // const project = useElllProject();
  // const loaded = useObservable(project.spec.loaded$, project.spec.loaded);
  // const generatingFeatures = useObservable(
  //   project.spec.generatingFeatures$,
  //   project.spec.generatingFeatures,
  // );
  // const organizingFeatures = useObservable(
  //   project.spec.organizingFeatures$,
  //   project.spec.organizingFeatures,
  // );
  // const [addingFeature, setAddingFeature] = useState(false);

  // if (!loaded) {
  //   return <DrawerLoader message="Loading project spec..." />;
  // }

  // return (
  //   <div className="el-h-full el-w-full el-flex el-flex-col el-relative">
  //     {generatingFeatures || organizingFeatures ? (
  //       <div
  //         style={{
  //           position: "absolute",
  //           top: 0,
  //           left: 0,
  //           right: 0,
  //         }}
  //       >
  //         <ProgressBar />
  //       </div>
  //     ) : (
  //       <></>
  //     )}

  //     <div className="el-grow el-overflow-hidden">
  //       <FeatureBoard
  //         addingFeature={addingFeature}
  //         onAddFeature={() => setAddingFeature(true)}
  //       />
  //     </div>
  //     <div className="el-p-4">
  //       {addingFeature ? (
  //         <AddFeatureControl onCompleted={() => setAddingFeature(false)} />
  //       ) : (
  //         <div className="el-flex el-justify-between el-items-center">
  //           <div className="el-flex el-gap-2">
  //             <IconButton
  //               icon={elllIcons16.plus}
  //               onClick={() => setAddingFeature(true)}
  //               className="el-h-7 el-w-7"
  //             />
  //             <IconButton
  //               icon={elllIcons16.template}
  //               onClick={() => project.spec.organizeFeatures()}
  //               className="el-h-7 el-w-7"
  //             />
  //           </div>
  //           <button className="el-px-2 el-h-7 el-rounded el-bg-pm">
  //             Build All Features
  //           </button>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );

  return <>FeatureEditor</>;
}
