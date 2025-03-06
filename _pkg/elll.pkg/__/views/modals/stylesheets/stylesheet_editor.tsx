import {
  ColumnControlContainer,
  FullControlEntry,
  ScrollArea,
  SelectControl,
} from "@repo/components";
import { Stylesheet } from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { StyleEditor } from "~/src/components/styles/style_editor";
import { useWorkspaceState } from "../../../hooks/shell/workspace";
import { resolveArrayIntersection } from "../../../libs/utils";

export function StylesheetEditor({
  stylesheets,
}: {
  stylesheets: Stylesheet[];
}): JSX.Element {
  let [activeSelector, setActiveSelector] = useWorkspaceState<
    string | undefined
  >(
    [
      "stylesheetEditor",
      "activeSelector",
      stylesheets.map((s) => s.key).join(","),
    ],
    "base",
  );
  const styleSelectors = useManyObservables(
    stylesheets.map((s) => s.selectors$),
    stylesheets.map((s) => s.selectors),
    stylesheets.map((s) => s.key).join(","),
  );
  const commonSelectors = resolveArrayIntersection(styleSelectors);
  const styles = useManyObservables(
    stylesheets.map((s) => s.style$(activeSelector!, true)),
    stylesheets.map((s) => s.style(activeSelector!, true)),
    stylesheets.map((s) => s.key).join(",") + ":" + activeSelector,
  );

  return (
    <div
      className="el-h-full el-flex el-flex-col el-pt-1"
      style={{
        width: 260,
        height: "calc(100vh - 200px)",
        margin: -12,
      }}
    >
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
      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY>
          <StyleEditor styles={styles} />
        </ScrollArea>
      </div>
    </div>
  );
}
