import { elllIcons16, Icon, ScrollArea, TreeEntry } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useElll } from "~/src/hooks/elll/elll";
import { useElllProject } from "~/src/hooks/project/project";
import { keys } from "~/src/libs/keys";

export function StyleSystemView(): JSX.Element {
  const elll = useElll();
  const project = useElllProject();
  const modifierSheetModel = useObservable(
    project.styleManager.modifierSheet.model$,
    project.styleManager.modifierSheet.model,
  );
  const variableSheetModel = useObservable(
    project.styleManager.variableSheet.model$,
    project.styleManager.variableSheet.model,
  );

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-4"
    >
      <div className="el-space-y-1">
        <label className="el-text-fg-400">
          Create and manage reusable variables for consistent styling.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.variable} />}
          className="el-border"
          onClick={() => {
            elll.editorManager.openEditor(keys.editors.variableSheet);
          }}
          actions={[
            {
              icon: <Icon name={elllIcons16.textJustify} />,
              handler: () => {
                if (variableSheetModel) {
                  elll.editorManager.openModel(
                    keys.editors.json,
                    variableSheetModel.url,
                  );
                }
              },
            },
          ]}
        >
          Variables
        </TreeEntry>
      </div>

      <div className="el-space-y-1">
        <label className="el-text-fg-400">
          Create and manage reusable modifiers for dynamic styling.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.variable} />}
          className="el-border"
          onClick={() => {
            if (modifierSheetModel) {
              elll.editorManager.openModel(
                keys.editors.json,
                modifierSheetModel.url,
              );
            }
          }}
        >
          Modifiers
        </TreeEntry>
      </div>

      <div className="el-space-y-1">
        <label className="el-text-fg-400">
          Set up global settings for your design system.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.properties} />}
          className="el-border"
          onClick={() => {
            elll.shell.showModal({
              viewId: keys.views.modals.styleSystem,
              affinity: "workspace",
              closeOnBackdropClick: true,
              closeOnEscape: true,
            });
          }}
        >
          Configuration
        </TreeEntry>
      </div>
    </ScrollArea>
  );
}
