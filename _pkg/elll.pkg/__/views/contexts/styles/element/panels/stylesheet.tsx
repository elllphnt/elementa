import {
  ColumnControlContainer,
  elllIcons16,
  FullControlEntry,
  SelectControl,
} from "@repo/components";
import { CodeComponentElementHandle } from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import { useState } from "react";
import SheetContainer from "../../../../../components/sheet/sheet_container";
import { SheetView } from "../../../../../components/sheet/types";
import { elementaSheetViews } from "../../../../sheets/elementa/_";
import { ContextPanelHeader } from "../../../_common/header";
import { activeControlPanelKey } from "../_libs";

const sheets = [
  elementaSheetViews.styleBox,
  elementaSheetViews.styleStyle,
] as SheetView[];

export function CodeComponentStylesheetPropertiesPanel({
  selection,
  stateKey,
  args,
}: {
  selection: CodeComponentElementHandle[];
  stateKey: string[];
  args: string;
}): JSX.Element {
  const name = args;
  const config = useObservable(
    selection[0]?.entity.config$,
    selection[0]?.entity.config,
  );
  const stylesheets = useManyObservables(
    selection.map((a) => a.entity.codeStylesheet$(name, true)),
    selection.map((a) => a.entity.codeStylesheet(name, true)),
  );
  const [activeSelector, setActiveSelector] = useState("base");
  const displayName = config?.stylesheets[name]?.displayName || name;
  const styles = useManyObservables(
    stylesheets.map((s) => s?.style$(activeSelector, true)),
    stylesheets.map((s) => s?.style(activeSelector, true)),
    stylesheets.map((s) => s.key).join(",") + ":" + activeSelector,
  );

  return (
    <div className="el-h-full el-flex el-flex-col">
      <div>
        <ContextPanelHeader
          title={displayName}
          icon={elllIcons16.stylesheet}
          onBack={() => {
            selection.forEach((h) => {
              h.entity.setEditorState(activeControlPanelKey, undefined);
            });
          }}
        />
        <ColumnControlContainer>
          <FullControlEntry label="Style">
            <SelectControl
              value={activeSelector}
              onChange={(value) => setActiveSelector(value ?? "base")}
              settings={{
                options: [
                  { label: "Base", value: "base" },
                  { label: "Hover", value: "state:hover" },
                  { label: "Focus", value: "state:focus" },
                  { label: "Active", value: "state:active" },
                  { label: "Disabled", value: "state:disabled" },
                ],
              }}
            />
          </FullControlEntry>
        </ColumnControlContainer>
        <hr />
      </div>
      <div className="el-grow el-overflow-hidden">
        <SheetContainer
          key={selection.map((s) => s.key).join(",")}
          sheets={sheets.map((sheet) => ({
            key: sheet.id,
            viewId: sheet.id,
            title: sheet.title,
          }))}
          stateKey={[...stateKey, "sheets"]}
          props={{
            styles,
          }}
        />
      </div>
    </div>
  );
}
