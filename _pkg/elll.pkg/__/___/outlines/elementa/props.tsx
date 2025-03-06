import { Icon, TreeEntry, elllIcons16, useControlMenu } from "@repo/components";
import { Elementa, Prop } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useCallback, useState } from "react";

function PropEntry({
  prop,
  onRemove,
}: {
  prop: Prop;
  onRemove: () => void;
}): JSX.Element {
  const { openMenu } = useControlMenu();
  const name = useObservable(prop.name$, prop.name);
  const [editing, setEditing] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <TreeEntry
      onDoubleClick={() => setEditing(true)}
      icon={<Icon name={elllIcons16.model} className="el-h-4 el-w-4" />}
      suffix={
        hover ? (
          <Icon
            name={elllIcons16.cross}
            className="el-h-4 el-w-4 el-text-fg-400 hover:el-text-fg-400 el-cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          />
        ) : (
          <></>
        )
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {editing ? (
        <input
          className="el-w-full"
          style={{
            outline: "none",
          }}
          value={name}
          placeholder="unnamed"
          onChange={(e) => prop.setName(e.target.value)}
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

function AddPropButton({ onClick }: { onClick: () => void }) {
  return (
    <TreeEntry
      onClick={onClick}
      icon={<Icon name={elllIcons16.plus} className="el-h-4 el-w-4" />}
      className="el-text-fg-500 hover:el-text-fg-500"
    >
      Add property
    </TreeEntry>
  );
}

export function NewPropEntry({
  onCompleted,
}: {
  onCompleted?: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const handleComplete = useCallback(async () => {
    onCompleted?.(name);
  }, [name]);

  return (
    <TreeEntry icon={<Icon name={elllIcons16.model} />}>
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

export function PropsOutline({
  elementa,
  stateKey,
}: {
  elementa: Elementa;
  stateKey: string[];
}): JSX.Element {
  const component = useObservable(elementa.component$, elementa.component);
  const props = useObservable(component?.props$, component?.props) ?? [];
  const [adding, setAdding] = useState(false);

  const handleAddProp = useCallback((name: string) => {
    setAdding(false);
    const trimmed = name.trim();
    if (!trimmed) return;
    if (component) {
      component.addProp(trimmed);
    }
  }, []);

  let content = <></>;

  if (component) {
    content = (
      <>
        {props.map((prop) => (
          <PropEntry
            key={prop.key}
            prop={prop}
            onRemove={() => component.removeProp(prop)}
          />
        ))}
        {adding ? (
          <NewPropEntry onCompleted={handleAddProp} />
        ) : (
          <AddPropButton onClick={() => setAdding(true)} />
        )}
      </>
    );
  } else {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        No component available.
        <br /> Please load a component to view its properties.
      </div>
    );
  }

  return <div className="el-px-2 el-pb-2 el-space-y-2">{content}</div>;
}
