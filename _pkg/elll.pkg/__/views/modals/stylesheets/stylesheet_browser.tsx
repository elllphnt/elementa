import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { Component, StylesheetEntity } from "@repo/elementa";
import { useObservable } from "@repo/utils";

function StylesheetItem({
  stylesheet,
  onSelect,
}: {
  stylesheet: StylesheetEntity;
  onSelect: (stylesheet: StylesheetEntity) => void;
}): JSX.Element {
  const name = useObservable(stylesheet.name$, stylesheet.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.stylesheet} className="el-h-4 el-w-4" />}
      onClick={(e) => {
        onSelect(stylesheet);
      }}
    >
      {name || <span className="el-text-fg-500">unnamed</span>}
    </TreeEntry>
  );
}

export function StylesheetBrowser({
  onSelect,
  component,
}: {
  component?: Component;
  onSelect: (stylesheet: StylesheetEntity) => void;
}): JSX.Element {
  const stylesheets =
    useObservable(component?.stylesheets$, component?.stylesheets) || [];

  return (
    <div className="el-px-2 el-pb-2 el-space-y-2">
      {stylesheets.map((stylesheet) => (
        <StylesheetItem
          key={stylesheet.key}
          stylesheet={stylesheet}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
