import { Icon, Tooltip } from "@repo/components";
import cx from "classnames";
import { useMemo } from "react";
import { map } from "rxjs";
import { Activity } from "~/src/models/activity";
import { useObservable } from "@repo/utils";
import { useWorkspace } from "../../hooks/workspace";

export function ActivityButton({
  activity,
}: {
  activity: Activity;
}): JSX.Element {
  const workspace = useWorkspace();
  const active$ = useMemo(
    () =>
      workspace.state
        .value$("activeActivityId")
        .pipe(map((id) => id === activity.id)),
    [workspace, activity.id],
  );
  const activityPanelVisible = useObservable(
    workspace.state.value$("activityPanel.visible"),
    workspace.state.value("activityPanel.visible"),
  );
  const active = useObservable(active$, false) && activityPanelVisible;

  return (
    <Tooltip
      content={activity.name}
      side="right"
      delayDuration={0}
      sideOffset={8}
    >
      <button
        style={{
          width: "100%",
          aspectRatio: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className={cx(
          "el-relative el-w-full el-aspect-square el-flex el-items-center el-justify-center el-px-1.5",
          {
            "el-text-fg-300 hover:el-text-fg-400": !active,
            "el-text-pm": active,
          },
        )}
        onClick={() => {
          if (!active) {
            workspace.state.set("activeActivityId", activity.id);
            workspace.state.set("activityPanel.visible", true);
          } else {
            workspace.state.set("activeActivityId", undefined);
          }
        }}
      >
        {active && (
          <>
            <div
              className="el-absolute el-bg-pm"
              style={{
                width: 4,
                height: 16,
                left: -1,
                borderRadius: "0 2px 2px 0",
              }}
            />
          </>
        )}

        <Icon name={activity.icon} className="el-h-5 el-w-5" />
      </button>
    </Tooltip>
  );
}

export function ActivityBar(): JSX.Element {
  const workspace = useWorkspace();
  const primaryActivities = useObservable(
    workspace.primaryActivities$,
    workspace.primaryActivities,
  );
  const secondaryActivities = useObservable(
    workspace.secondaryActivities$,
    workspace.secondaryActivities,
  );

  return (
    <div
      className="el-h-full el-w-full"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {primaryActivities.map((activity) => (
        <ActivityButton key={activity.id} activity={activity} />
      ))}
      <div style={{ flexGrow: 1 }} />
      {secondaryActivities.map((activity) => (
        <ActivityButton key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

export default ActivityBar;
