import { elllIcons16, Icon } from "@repo/components";
// import { ElementaViewer } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useEffect, useState } from "react";
import { ElementaViewerState } from "~/src/editors/elementa/viewer";

function IconButton({
  icon,
  onClick,
  disabled,
  iconClassName,
}: {
  icon: string;
  disabled?: boolean;
  onClick: () => void;
  iconClassName?: string;
}) {
  return (
    <button
      className={cx(
        "el-h-6 el-w-6 el-rounded el-flex el-items-center el-justify-center",
        {
          "el-text-fg-400 hover:el-text-fg-500 hover:el-bg-fg/5": !disabled,
          "el-text-fg-300": disabled,
        },
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={icon} className={iconClassName} />
    </button>
  );
}

function AddressInput({ editor }: { editor: ElementaViewerState }) {
  const viewer = useObservable(editor.elementaViewer$, editor.elementaViewer);
  const address = useObservable(viewer?.address$, viewer?.address);
  const [value, setValue] = useState(address);

  useEffect(() => {
    if (address) {
      setValue(address);
    }
  }, [address]);

  return (
    <div className="el-flex el-items-center el-gap-1 el-h-6 el-w-full el-border el-rounded-full">
      <input
        className="el-px-3"
        style={{
          height: "100%",
          width: "100%",
        }}
        value={value}
        placeholder="Enter address"
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            viewer?.setAddress(value);
          }
        }}
      />
    </div>
  );
}

function ComponentViewerBarContent({
  editor,
}: {
  editor: ElementaViewerState;
}): JSX.Element {
  return (
    <div
      className="el-p-1 el-gap-2"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div className="el-grow">
        <AddressInput editor={editor} />
      </div>

      <div className="el-flex el-gap-1">
        <IconButton
          icon={elllIcons16.cross}
          onClick={() => {
            editor.elll.shell.workspace?.setFocusedEditor(undefined);
          }}
        />
      </div>
    </div>
  );
}

export function ComponentViewerBar({
  editor,
}: {
  editor: ElementaViewerState;
}): JSX.Element {
  const elementaEditor = useObservable(
    editor.elementaViewer$,
    editor.elementaViewer,
  );

  if (!elementaEditor) {
    return <></>;
  } else {
    return <ComponentViewerBarContent editor={editor} />;
  }
}
