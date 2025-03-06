import { EdgeResizeHandle, StaticSplit } from "@repo/components";
import { resizeSplit, useObservable, useRect } from "@repo/utils";
import cx from "classnames";
import { useMemo, useRef } from "react";
import { map } from "rxjs";
import { useWorkspace } from "~/src/hooks/workspace";
import { Workspace } from "~/src/models/workspace";
import { GeneralBoard } from "../boards/general_board";
import NotificationContainer from "../notifications/notification_container";
import ToastContainer from "../toast/toast_container";
import ActivityPanel from "./panels/activity_panel";
import ContextPanel from "./panels/context_panel";
import { useAllContexts } from "./_hooks/contexts";

const ACTIVITY_PANEL_MIN_SIZE = 240;
const CONTEXT_PANEL_MIN_SIZE = 240;
const AREA_MIN_SIZE = 200;

export function BenchView({
  workspace,
}: {
  workspace: Workspace;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRect(ref);
  const resizeRef = useRef<{
    startSizes: number[];
  }>({
    startSizes: [],
  });

  const [_activeEditorId$, _activeEditorId] = useMemo(() => {
    const activeEditorId$ = workspace.activeEditor$.pipe(
      map((editor) => editor?.editorId),
    );
    const activeEditorId = workspace.activeEditor?.editorId;

    return [activeEditorId$, activeEditorId] as const;
  }, [workspace]);
  const allContexts = useAllContexts(workspace);
  const activeEditorId = useObservable(_activeEditorId$, _activeEditorId);
  const activeActivityId = useObservable(
    workspace.state.value$("activeActivityId"),
    workspace.state.value("activeActivityId"),
  );
  const _activityPanelVisible =
    useObservable(
      workspace.state.value$("activityPanel.visible"),
      workspace.state.value("activityPanel.visible"),
    ) && workspace.layout.activityPanel;
  const _contextPanelVisible =
    useObservable(
      workspace.state.value$("contextPanel.visible"),
      workspace.state.value("contextPanel.visible"),
    ) &&
    workspace.layout.contextPanel &&
    !!allContexts.length;
  const _activityPanelSize = useObservable(
    workspace.state.value$("activityPanel.size", ACTIVITY_PANEL_MIN_SIZE),
    workspace.state.value("activityPanel.size", ACTIVITY_PANEL_MIN_SIZE),
  );
  const contextPanelSizeKey = [
    "contextPanel",
    "size",
    activeEditorId || "__default__",
  ];
  const _contextPanelSize = useObservable(
    workspace.state.value$(contextPanelSizeKey, CONTEXT_PANEL_MIN_SIZE),
    workspace.state.value(contextPanelSizeKey, CONTEXT_PANEL_MIN_SIZE),
    contextPanelSizeKey.join("."),
  );

  const activityPanelVisible = _activityPanelVisible && !!activeActivityId;
  const contextPanelVisible = _contextPanelVisible;

  const activityPanelActualSize = activityPanelVisible ? _activityPanelSize : 0;
  const contextPanelActualSize = contextPanelVisible ? _contextPanelSize : 0;

  const boardSize = rect
    ? rect.width - (activityPanelActualSize + contextPanelActualSize)
    : 0;
  const sizes = [activityPanelActualSize, boardSize, contextPanelActualSize];

  function handleResizeStart() {
    resizeRef.current.startSizes = sizes.map((s) => s || 0);
  }
  function handleResizeUpdate(edge: number, delta: number) {
    const newSizes = resizeSplit(
      resizeRef.current.startSizes,
      edge,
      delta,
      AREA_MIN_SIZE,
    );
    workspace.state.set("activityPanel.size", newSizes[0]);
    workspace.state.set(contextPanelSizeKey, newSizes[2]);
  }
  function handleResizeEnd() {
    resizeRef.current.startSizes = [];
  }

  console.log("ComponentEditorState render", sizes, activeEditorId);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <StaticSplit ref={ref} segments={sizes}>
        {rect
          ? [
              <ActivityPanelSlice
                key="activity-panel"
                onResizeEnd={handleResizeEnd}
                onResizeStart={handleResizeStart}
                onResizeUpdate={handleResizeUpdate}
              />,
              <GeneralBoard key="general-board" />,
              <ContextPanelSlice
                key="context-panel"
                onResizeEnd={handleResizeEnd}
                onResizeStart={handleResizeStart}
                onResizeUpdate={handleResizeUpdate}
              />,
            ]
          : []}
      </StaticSplit>

      <ToastContainer />
      <NotificationContainer />
    </div>
  );
}
export function ActivityPanelSlice({
  onResizeEnd,
  onResizeStart,
  onResizeUpdate,
}: {
  onResizeStart: () => void;
  onResizeUpdate: (edge: number, delta: number) => void;
  onResizeEnd: () => void;
}): JSX.Element {
  const workspace = useWorkspace();
  const activeActivityId = useObservable(
    workspace.state.value$("activeActivityId"),
    workspace.state.value("activeActivityId"),
  );
  const _activityPanelVisible =
    useObservable(
      workspace.state.value$("activityPanel.visible"),
      workspace.state.value("activityPanel.visible"),
    ) && workspace.layout.activityPanel;

  const activityPanelVisible = _activityPanelVisible && !!activeActivityId;

  return (
    <div
      className={cx(" el-relative", {
        "el-border-r": activityPanelVisible,
      })}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    >
      <ActivityPanel />
      <EdgeResizeHandle
        edge="right"
        onResizeStart={() => onResizeStart()}
        onResizeUpdate={(delta) => onResizeUpdate(1, delta)}
        onResizeEnd={() => onResizeEnd()}
      />
    </div>
  );
}
export function ContextPanelSlice({
  onResizeEnd,
  onResizeStart,
  onResizeUpdate,
}: {
  onResizeStart: () => void;
  onResizeUpdate: (edge: number, delta: number) => void;
  onResizeEnd: () => void;
}): JSX.Element {
  return (
    <div
      className="el-border-l el-relative"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <EdgeResizeHandle
        edge="left"
        onResizeStart={() => onResizeStart()}
        onResizeUpdate={(delta) => onResizeUpdate(2, -delta)}
        onResizeEnd={() => onResizeEnd()}
      />
      <ContextPanel />
    </div>
  );
}

export default BenchView;
