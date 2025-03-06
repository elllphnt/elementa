import { useEffect, useRef } from "react";
import { getMonaco } from "~/src/libs/monaco";

function Editor({ model }: { model?: any }) {
  const container1Ref = useRef(null);
  const container2Ref = useRef(null);

  useEffect(() => {
    const container1 = container1Ref.current;
    const container2 = container2Ref.current;

    if (!container1 || !container2) return;

    getMonaco().then((monaco) => {
      //       const model = monaco.editor.createModel(
      //         `function x() {
      //       console.log("Hello world!");
      //   }`,
      //         "typescript",
      //       );

      const e1 = monaco.editor.create(container1, {
        model,
        automaticLayout: true,
      });
      //   monaco.editor.setModelLanguage(model, "typescript");

      const e2 = monaco.editor.create(container2, {
        model,
        automaticLayout: true,
      });
    });
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", pointerEvents: "auto" }}>
      <div
        ref={container1Ref}
        style={{
          height: "50%",
          width: "100%",
        }}
      />
      <div
        ref={container2Ref}
        style={{
          height: "50%",
          width: "100%",
        }}
      />
    </div>
  );
}

export default Editor;
