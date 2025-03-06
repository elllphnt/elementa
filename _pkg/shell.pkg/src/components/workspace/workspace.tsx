import { ContextMenuView } from "@repo/components";
import { useEffect, useMemo, useRef } from "react";
import { Workspace } from "~/src/models/workspace";
import { useObservable } from "@repo/utils";
import FocusedBoard from "../boards/focused_board";
import WorkspaceModalContainer from "../modals/center_modal/center_modal_container";
import ActivityBar from "./activity_bar";
import AppBar from "./app_bar";
import BenchView from "./bench";

export function WorkspaceView({
  workspace,
}: {
  workspace: Workspace;
}): JSX.Element {
  const ref = useRef<HTMLElement | null>(null);

  const appBarVisible =
    useObservable(
      workspace.state.value$("appBar.visible", true),
      workspace.state.value("appBar.visible", true),
    ) && workspace.layout.appBar;
  const statusBarVisible =
    useObservable(
      workspace.state.value$("statusBar.visible", true),
      workspace.state.value("statusBar.visible", true),
    ) && workspace.layout.statusBar;
  const activityBarVisible =
    useObservable(
      workspace.state.value$("activityBar.visible", true),
      workspace.state.value("activityBar.visible", true),
    ) && workspace.layout.activityBar;
  const focusedEditor = useObservable(
    workspace.focusedEditor$,
    workspace.focusedEditor,
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    workspace.setRoot(ref.current);
    return () => {
      workspace.setRoot(undefined);
    };
  }, []);

  const bench = useMemo(() => {
    return (
      <>
        {activityBarVisible && (
          <div
            className="el-relative el-w-10 el-border-r"
            style={{
              pointerEvents: "auto",
            }}
          >
            <ActivityBar />
          </div>
        )}
        <div className="el-grow" style={{ overflow: "hidden" }}>
          <BenchView workspace={workspace} />
        </div>
      </>
    );
  }, [activityBarVisible, workspace]);

  const focused = useMemo(() => {
    if (focusedEditor) {
      return <FocusedBoard key="focused-editor" state={focusedEditor} />;
    } else {
      return <></>;
    }
  }, [focusedEditor]);

  let body = focusedEditor ? focused : bench;

  return (
    <div
      ref={(el) => {
        ref.current = el;
      }}
      style={{
        userSelect: "none",
        pointerEvents: "none",
      }}
      className="el-relative el-h-full el-w-full el-bg-bg el-flex el-flex-col"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {appBarVisible && (
        <div
          className="el-relative el-h-9 el-border-b"
          style={{ flexShrink: 0, zIndex: 2, pointerEvents: "auto" }}
        >
          <AppBar />
        </div>
      )}
      <div
        className="el-flex el-grow"
        style={{ overflow: "hidden", zIndex: 1 }}
      >
        {body}
      </div>
      {statusBarVisible && (
        <div
          className="el-h-6 el-border-t el-hidden"
          style={{ flexShrink: 0, zIndex: 2, pointerEvents: "auto" }}
        >
          Status bar
        </div>
      )}

      <ContextMenuView />
      <WorkspaceModalContainer />
    </div>
  );
}

export default WorkspaceView;
