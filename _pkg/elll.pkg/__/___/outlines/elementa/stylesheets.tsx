import { Icon, TreeEntry, elllIcons16, useControlMenu } from "@repo/components";
import { Elementa, StylesheetEntity } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useState } from "react";

function StylesheetEntry({
  stylesheet,
}: {
  stylesheet: StylesheetEntity;
}): JSX.Element {
  const { openMenu } = useControlMenu();
  const name = useObservable(stylesheet.name$, stylesheet.name);
  const [editing, setEditing] = useState(false);

  return (
    <TreeEntry
      onDoubleClick={() => setEditing(true)}
      icon={<Icon name={elllIcons16.stylesheet} className="el-h-4 el-w-4" />}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            stylesheet.remove();
          },
        },
      ]}
    >
      {editing ? (
        <input
          className="el-w-full"
          style={{
            outline: "none",
          }}
          value={name}
          placeholder="unnamed"
          onChange={(e) => stylesheet.setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          autoFocus
        />
      ) : (
        name || <span className="el-text-fg-500">unnamed</span>
      )}
    </TreeEntry>
  );
}

function AddButton({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleComplete = () => {
    setName("");
    setAdding(false);
    const trimmed = name.trim();
    if (trimmed) {
      onAdd(trimmed);
    }
  };

  if (adding) {
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
  } else {
    return (
      <TreeEntry
        onClick={() => setAdding(true)}
        icon={<Icon name={elllIcons16.plus} className="el-h-4 el-w-4" />}
        className="el-text-fg-500 hover:el-text-fg-500"
      >
        Add Stylesheet
      </TreeEntry>
    );
  }
}

export function StylesheetsOutline({
  elementa,
  stateKey,
}: {
  elementa: Elementa;
  stateKey: string[];
}): JSX.Element {
  const component = useObservable(elementa.component$, elementa.component);
  const stylesheets =
    useObservable(component?.stylesheets$, component?.stylesheets) ?? [];

  return (
    <div className="el-px-2 el-pb-2 el-space-y-2">
      {stylesheets.map((stylesheet) => (
        <StylesheetEntry key={stylesheet.key} stylesheet={stylesheet} />
      ))}
      <AddButton
        onAdd={(name) => {
          if (!component) return;
          const stylesheet = new StylesheetEntity({ component });
          stylesheet.setName(name);
          component.addStylesheet(stylesheet);
        }}
      />
    </div>
  );
}
