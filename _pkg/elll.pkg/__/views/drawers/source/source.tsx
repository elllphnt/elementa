import { elllFileTypes } from "@elllphnt/utils";
import { ContextMenuOption } from "@repo/components";
import { ReactNode } from "react";
import { WorkspaceDirectoryView } from "../../../components/workspace_directory";
import { codeEditor } from "../../../editors/code/code";
import { useElll } from "../../../hooks/elll/elll";
import { mimeTypes } from "../../../libs/constants/mime_types";

export function SourceView(): JSX.Element {
  const elll = useElll();

  let extraEntries: ReactNode | undefined = undefined;

  return (
    <>
      <WorkspaceDirectoryView
        path="components"
        fileTypes={[
          { type: elllFileTypes.components.elll, name: "Elll Component" },
          {
            type: elllFileTypes.components.react,
            name: "Code Component",
          },
          { type: elllFileTypes.state, name: "State" },
        ]}
        defaultFileType={elllFileTypes.components.elll}
        defaultFileTypeName="component"
        extraEntries={extraEntries}
        contextMenuOptions={(file) => {
          const options = [] as ContextMenuOption[][];
          const openOptions = [] as ContextMenuOption[];

          if (
            file.type === elllFileTypes.components.elll ||
            file.type === mimeTypes.component.semantic
          ) {
            openOptions.push({
              label: "Open as text",
              action: () => {
                elll.editorManager.openFile(file.url, {
                  preferedEditorId: codeEditor.id,
                });
              },
            });
          }

          if (openOptions.length) {
            options.push(openOptions);
          }
          return options;
        }}
      />
    </>
  );
}
