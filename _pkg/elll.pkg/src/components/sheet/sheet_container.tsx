import { ScrollArea, ViewComponent } from "@repo/components";
import { useShell } from "@repo/shell";
import { useManyObservables } from "@repo/utils";
import { of } from "rxjs";
import { Sheet } from "./sheet";
import { SheetData, SheetView } from "./types";

export function SheetContainer<P extends {} = {}>({
  stateKey,
  sheets,
  props,
  noPadding,
  noXPadding,
  noYPadding,
}: {
  stateKey: string[];
  sheets: SheetData<P>[];
  props: P;
  noPadding?: boolean;
  noXPadding?: boolean;
  noYPadding?: boolean;
}): JSX.Element {
  const shell = useShell();
  const sheetsKey = sheets.map((s) => s.key).join(",");
  let views = useManyObservables(
    sheets.map((sheet) => shell.viewStore.view$(sheet.viewId)),
    sheets.map((sheet) => shell.viewStore.view(sheet.viewId)),
    sheetsKey,
  ) as (SheetView<P> | undefined)[];
  // make sure a default reactive enabled is set when the static enabled is set
  views = views.map((view) => {
    if (!view) return view;
    if (view.enabled && !view.enabled$) {
      return {
        ...view,
        enabled$: (props: P) => of(view.enabled!(props)),
      };
    } else {
      return view;
    }
  });

  const enableds = useManyObservables(
    views.map((view) => view?.enabled$?.(props) ?? of(true)),
    views.map((view) => view?.enabled?.(props) ?? true),
    props,
  );
  const sheetWithView = sheets.map(
    (sheet, index) => [sheet, views[index]] as const,
  );
  const enabledSheets = sheetWithView.filter((_, index) => enableds[index]);

  return (
    <ScrollArea scrollY>
      {enabledSheets.map(([sheet, view], index) => {
        const _title = sheet.title ?? view?.title;
        const title = typeof _title === "function" ? _title(props) : _title;
        return (
          <>
            {index > 0 ? <hr /> : <> </>}
            <Sheet
              key={sheet.key}
              title={title}
              noIndent={sheet.noIndent}
              noPadding={noPadding}
              noXPadding={noXPadding}
              noYPadding={noYPadding}
            >
              <ViewComponent
                id={sheet.viewId}
                props={{ ...props, stateKey: [...stateKey, sheet.key] }}
              />
            </Sheet>
          </>
        );
      })}
    </ScrollArea>
  );
}

export default SheetContainer;
