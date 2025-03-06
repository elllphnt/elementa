import {
  BaseControlType,
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import {
  ElementHandle,
  StylesheetEntity,
  useElementaEditor,
} from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import { useState } from "react";
import { EvaluableControlEntry } from "../../../../../../components/controls/infrastructure/evaluable/evaluable";
import { useCommonReactivePair } from "../../../../../../hooks/utils/reactivity";
import { resolveArrayIntersection } from "../../../../../../libs/utils";
import { modalViews } from "../../../../../modals/_";

export function ElementStylesheetsControlSheet({
  selection,
}: {
  selection: ElementHandle[];
}): JSX.Element {
  const editor = useElementaEditor();
  const stylesheets = useManyObservables(
    selection.map((handle) => handle.entity.stylesheets$),
    selection.map((handle) => handle.entity.stylesheets),
    selection.map((handle) => handle.entity.key).join(","),
  );
  const [adding, setAdding] = useState(false);
  const { openMenu, closeMenu } = useControlMenu();

  // add stylesheet action
  useAction({
    title: "Add Stylesheet",
    icon: elllIcons16.plus,
    handler: () => setAdding(true),
    index: 1,
  });

  // browse stylesheets action
  useAction({
    title: "Browse Stylesheets",
    icon: elllIcons16.folderOpen,
    handler: (e) => {
      openMenu({
        anchor: e.currentTarget as any,
        viewId: modalViews.stylesheetBrowser.id,
        title: "Browse Stylesheets",
        props: {
          onSelect: (stylesheet: StylesheetEntity) => {
            selection.forEach((handle) => {
              handle.entity.setStylesheetValue(stylesheet.id, true);
            });
            closeMenu();
          },
          component: editor.component,
        },
      });
    },
    index: 0,
  });

  const stylesheetKeys = stylesheets.map((stylesheet) =>
    Object.keys(stylesheet),
  );
  const commonStylesheetKeys = resolveArrayIntersection(stylesheetKeys);

  return (
    <>
      {adding ? (
        <AddEntry
          onComplete={(name) => {
            setAdding(false);
            if (!name) return;
            const component = editor.component;
            if (!component) return;
            const stylesheet = new StylesheetEntity({ component });
            stylesheet.setName(name);
            component.addStylesheet(stylesheet);

            selection.forEach((handle) => {
              handle.entity.setStylesheetValue(stylesheet.id, true);
            });
          }}
        />
      ) : (
        <></>
      )}
      {commonStylesheetKeys.map((key) => (
        <StylesheetEntry key={key} stylesheetKey={key} selection={selection} />
      ))}
    </>
  );
}

function StylesheetEntry({
  stylesheetKey,
  selection,
}: {
  stylesheetKey: string;
  selection: ElementHandle[];
}): JSX.Element {
  const editor = useElementaEditor();
  const component = useObservable(editor.component$, editor.component);
  const entity = useObservable(
    component?.entity$(stylesheetKey),
    component?.entity(stylesheetKey),
  );
  const name = useObservable(entity?.name$, entity?.name);
  const [value$, value] = useCommonReactivePair(
    selection.map((handle) => handle.entity.stylesheetValue$(stylesheetKey)),
    selection.map((handle) => handle.entity.stylesheetValue(stylesheetKey)),
    selection.map((handle) => handle.entity.key).join(",") + stylesheetKey,
  );
  const { openMenu } = useControlMenu();

  return (
    <EvaluableControlEntry
      label={name || stylesheetKey}
      value$={value$}
      value={value}
      onChange={(v) => {
        selection.forEach((handle) => {
          handle.entity.setStylesheetValue(stylesheetKey, v);
        });
      }}
      control={BaseControlType.Boolean}
      onRemove={() => {
        selection.forEach((handle) => {
          handle.entity.removeStylesheet(stylesheetKey);
        });
      }}
      controlSettings={{
        variant: "full",
        options: {
          true: {
            label: <Icon name={elllIcons16.play} />,
          },
          false: {
            label: <Icon name={elllIcons16.cross} />,
          },
        },
      }}
      action={{
        icon: elllIcons16.properties,
        label: "Edit Stylesheet",
        handler: () => {
          const stylesheet = component?.entity(
            stylesheetKey,
          ) as StylesheetEntity;
          if (!stylesheet) return;
          openMenu({
            viewId: modalViews.stylesheetEditor.id,
            title: "Edit Stylesheet",
            props: {
              stylesheets: [stylesheet.sheet],
            },
          });
        },
      }}
    />
  );
}

function AddEntry({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleComplete = () => {
    setName("");
    onComplete(name.trim());
  };

  return (
    <TreeEntry icon={<Icon name={elllIcons16.stylesheet} />}>
      <input
        autoFocus
        type="text"
        value={name}
        style={{
          width: "100%",
          outline: "none",
        }}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onBlur={handleComplete}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            e.currentTarget.blur();
          }
        }}
      />
    </TreeEntry>
  );
}
