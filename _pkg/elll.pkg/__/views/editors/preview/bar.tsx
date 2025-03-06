import { elllIcons16, Icon, StatefulInput } from "@repo/components";
import { ElementaViewer } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { PreviewEditorState } from "../../../editors/preview/preview";
import { PreviewRouter } from "../../../editors/preview/router";

function UrlBar({ editor }: { editor: PreviewEditorState }): JSX.Element {
  const path = useObservable(editor.path$, editor.path);
  return (
    <StatefulInput
      className="el-w-full el-h-6 el-rounded-md el-px-2 el-border"
      style={{
        outline: "none",
      }}
      value={path}
      onChange={(e) => editor.elementaEditor?.router.push(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

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

export function PreviewEditorBarView({
  editor,
}: {
  editor: PreviewEditorState;
}): JSX.Element {
  const elementaEditor = useObservable(
    editor.elementaEditor$,
    editor.elementaEditor,
  );

  if (!elementaEditor) {
    return <></>;
  } else {
    return (
      <ElementaPreviewEditorBarView
        editor={editor}
        elementaEditor={elementaEditor}
      />
    );
  }
}

export function ElementaPreviewEditorBarView({
  editor,
  elementaEditor,
}: {
  editor: PreviewEditorState;
  elementaEditor: ElementaViewer;
}): JSX.Element {
  const router = elementaEditor.router as PreviewRouter;
  const canGoBack = useObservable(router.canGoBack$, false);
  const canGoForward = useObservable(router.canGoForward$, false);
  const colorScheme = useObservable(
    elementaEditor.colorScheme$,
    elementaEditor.colorScheme,
  );

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
      <div className="el-flex el-gap-1">
        <IconButton
          icon={elllIcons16.chevron}
          iconClassName="el-rotate-180"
          onClick={() => {
            router.goBack();
          }}
          disabled={!canGoBack}
        />
        <IconButton
          icon={elllIcons16.chevron}
          onClick={() => {
            router.goForward();
          }}
          disabled={!canGoForward}
        />
      </div>

      <UrlBar editor={editor} />
      <div className="el-flex el-gap-1">
        <IconButton
          key={colorScheme}
          icon={
            colorScheme === "default" ? elllIcons16.vector : elllIcons16.wrap
          }
          onClick={() => {
            elementaEditor.setColorScheme(
              colorScheme === "default" ? "dark" : "default",
            );
          }}
        />
        <IconButton
          icon={elllIcons16.cross}
          onClick={() => {
            editor.elll.shell.workspace.setFocusedEditor(undefined);
          }}
        />
      </div>
    </div>
  );
}
