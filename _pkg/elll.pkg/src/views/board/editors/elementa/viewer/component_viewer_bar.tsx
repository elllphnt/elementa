import { elllIcons16, Icon } from "@repo/components";
// import { ElementaViewer } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
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

function ComponentViewerBarContent({
  editor,
  // elementaEditor,
}: {
  editor: ElementaViewerState;
  // elementaEditor: ElementaViewer;
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
      <div className="el-flex el-gap-1"></div>

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
    return (
      <ComponentViewerBarContent
        editor={editor}
        // elementaEditor={elementaEditor}
      />
    );
  }
}
