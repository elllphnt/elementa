import {
  ElllPlaceholder,
  Icon,
  IconButton,
  ProgressBar,
  ScrollArea,
  ViewComponent,
  elllIcons16,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import React, { memo, useState } from "react";
import { useWorkspace } from "~/src/hooks/workspace";
import { EditorState } from "~/src/models/editor";

function EditorTab({
  editor,
  active,
}: {
  editor: EditorState;
  active: boolean;
}) {
  const workspace = useWorkspace();
  const title = useObservable(editor.title$, editor.title);
  const icon = useObservable(editor.icon$, editor.icon);
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: 160,
        cursor: "pointer",
        height: "100%",
      }}
      onClick={() => {
        workspace.activateEditor(editor);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cx("el-shrink-0 el-flex el-items-center el-px-2", {
          "el-text-fg-500 ": active,
          "el-text-fg-500": !active,
        })}
        style={{
          height: "100%",
        }}
      >
        <div className="el-shrink-0 el-mr-2 el-h-4 el-w-4">
          <Icon name={icon.name} color={icon.color} />
        </div>
        <div
          style={{
            flexGrow: 1,
            width: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title.trim() || <span className="el-text-fg-400">Untitled</span>}
        </div>
        {hover && (
          <IconButton
            icon={elllIcons16.cross}
            onClick={(event) => {
              event.stopPropagation();
              workspace.removeEditor(editor);
              editor.dispose();
            }}
          />
        )}
      </div>

      <div
        className={cx("el-bg-pm el-transition-opacity")}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}
function EditorActions({ editor }: { editor: EditorState }) {
  const actions = useObservable(editor.actions$, editor.actions);

  return (
    <div className="el-flex el-items-center el-space-x-1 el-h-full el-px-2">
      {actions.map((action) => (
        <IconButton
          key={action.name}
          icon={action.icon}
          onClick={action.action}
        />
      ))}
    </div>
  );
}

function BoardBar({
  activeEditor,
  editors,
}: {
  editors: EditorState[];
  activeEditor: EditorState | undefined;
}): JSX.Element {
  const workspace = useWorkspace();
  const state = useObservable(workspace.activeEditor$, workspace.activeEditor);
  const loading = useObservable(activeEditor?.loading$, activeEditor?.loading);

  return (
    <div
      className="el-relative el-h-9 el-overflow-hidden el-shrink-0"
      style={{
        display: "flex",
        pointerEvents: "auto",
      }}
    >
      <div
        className="el-bg-bg-200"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
        }}
      />
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <ScrollArea
          scrollX
          noHandle
          containerClassName="el-flex el-items-center el-h-9"
        >
          {editors.map((editor) => (
            <React.Fragment key={editor.key}>
              <div
                style={{
                  height: "100%",
                }}
              >
                <EditorTab editor={editor} active={editor === state} />
              </div>
              <div
                style={{
                  width: 1,
                  height: 24,
                  flexShrink: 0,
                }}
                className="el-bg-bg-200"
              />
            </React.Fragment>
          ))}
        </ScrollArea>
      </div>
      <div>{state && <EditorActions editor={state} key={state.key} />}</div>
      {loading ? (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
          className="el-text-pm"
        >
          <ProgressBar height={1} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
function BoardContent({ state }: { state?: EditorState }): JSX.Element {
  const editor = useObservable(state?.editor$, state?.editor);

  let content: JSX.Element;
  content = <ElllPlaceholder />;

  if (editor) {
    const boardViewId = editor.views.board;
    if (boardViewId && state) {
      content = (
        <ViewComponent
          key={state.key}
          id={boardViewId}
          props={{
            editor: state,
          }}
        />
      );
    }
  }

  return (
    <div className="el-grow el-relative">
      <div className="el-absolute el-inset-0 el-z-0">{content}</div>
    </div>
  );
}

function Placeholder(): JSX.Element {
  const workspace = useWorkspace();
  const defaultBoardView = workspace.layout.board?.defaultView;

  if (defaultBoardView) {
    return <ViewComponent id={defaultBoardView} />;
  } else {
    return <ElllPlaceholder />;
  }
}

export const GeneralBoard = memo(function GeneralBoard(): JSX.Element {
  const workspace = useWorkspace();
  const activeEditor = useObservable(
    workspace.activeEditor$,
    workspace.activeEditor,
  );
  const editors = useObservable(workspace.editors$, workspace.editors);

  let content: JSX.Element;

  if (editors.length) {
    content = (
      <>
        <BoardBar activeEditor={activeEditor} editors={editors} />
        <BoardContent key={activeEditor?.key} state={activeEditor} />
      </>
    );
  } else {
    content = <Placeholder />;
  }

  return (
    <div
      className={cx(
        "el-relative el-z-0 el-h-full el-w-full el-overflow-hidden el-flex el-flex-col",
      )}
      onMouseDownCapture={() => {
        if (!activeEditor?.stable) {
          activeEditor?.stabilize();
        }
      }}
    >
      {content}
    </div>
  );
});
