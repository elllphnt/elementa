import { ElllPlaceholder, ProgressBar, ViewComponent } from "@repo/components";
import cx from "classnames";
import { ReactNode } from "react";
import { useShell } from "~/src";
import { EditorState } from "~/src/models/editor";
import { useObservable } from "@repo/utils";

export function FocusedBoard({ state }: { state: EditorState }): JSX.Element {
  const shell = useShell();
  const editorId = state.editorId;
  const editor = editorId ? shell.editor(editorId) : undefined;

  let content = <ElllPlaceholder />;
  let topBar: ReactNode | undefined;
  const loading = useObservable(state?.loading$, state?.loading);

  if (editor) {
    const boardViewId = editor.views.board;
    const topBarViewId = editor.views.bar;
    if (boardViewId && state) {
      content = (
        <ViewComponent
          key={state?.key}
          id={boardViewId}
          props={{
            editor: state,
          }}
        />
      );
    }
    if (topBarViewId && state) {
      topBar = (
        <ViewComponent
          key={state?.key}
          id={topBarViewId}
          props={{
            editor: state,
          }}
        />
      );
    }
  }

  return (
    <div
      className={cx(
        "el-relative el-z-0 el-h-full el-w-full el-overflow-hidden el-flex el-flex-col",
      )}
      onMouseDownCapture={() => {
        if (!state?.stable) {
          state?.stabilize();
        }
      }}
    >
      {topBar ? (
        <div
          className="el-relative el-h-9 el-overflow-hidden el-shrink-0"
          style={{
            display: "flex",
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
          {topBar}
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
      ) : (
        <>
          {loading ? (
            <div
              style={{
                position: "absolute",
                top: 0,
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
        </>
      )}

      <div className="el-grow el-relative">
        <div className="el-absolute el-inset-0 el-z-0">{content}</div>
      </div>
    </div>
  );
}

export default FocusedBoard;
