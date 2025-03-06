import { elllIcons16, IconButton, ProgressBar } from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { useShell } from "~/src/hooks/shell";
import { Notification } from "~/src/models/notification_manager";

function NotificationView({
  notification,
  onCompleted,
}: {
  notification: Notification;
  onCompleted: () => void;
}) {
  const [counting, setCounting] = useState(true);
  const remainingRef = useRef(notification.duration || 0);
  const timerRef = useRef<any>(null);
  const startRef = useRef(0);

  useEffect(() => {
    const remaining = notification.duration || 0;
    if (remaining <= 0) {
      return;
    }

    if (counting) {
      startRef.current = Date.now();
      timerRef.current = setTimeout(onCompleted, remaining);
      return () => clearTimeout(timerRef.current);
    }
    if (!counting) {
      clearTimeout(timerRef.current);
      remainingRef.current = remaining - (Date.now() - startRef.current);
    }
  }, [counting, onCompleted]);

  const handleMouseEnter = () => {
    setCounting(false);
  };

  const handleMouseLeave = () => {
    setCounting(true);
  };

  return (
    <div
      className="el-bg-bg el-shadow-md el-border el-p-3 el-rounded el-space-y-3"
      style={{
        position: "relative",
        width: 300,
        pointerEvents: "auto",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="el-flex el-items-center el-space-x-2 el-justify-between">
        <div
          style={{
            fontWeight: "bold",
            flexGrow: 1,
          }}
        >
          {notification.title}
        </div>
        <IconButton icon={elllIcons16.cross} onClick={onCompleted} />
      </div>
      <div className="el-text-fg-400">{notification.message}</div>

      {notification.actions?.length ? (
        <div className="el-flex el-space-x-3">
          {notification.actions?.map((action, index) => (
            <button
              key={index}
              className={cx("el-w-full el-rounded  el-h-7", {
                "el-bg-fg/5 hover:el-bg-fg/10": !action.primary,
                "el-bg-pm hover:el-bg-pm-400 el-text-pm-ctr": action.primary,
              })}
              onClick={action.handler}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <></>
      )}
      {!notification.duration && notification.progress ? (
        <div
          className="el-text-pm"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <ProgressBar />
        </div>
      ) : null}
    </div>
  );
}

export function NotificationContainer(): JSX.Element {
  const shell = useShell();
  const notifications = useObservable(
    shell.notificationManager.notifications$,
    shell.notificationManager.notifications,
  );

  return (
    <div
      className="el-absolute el-bottom-3 el-right-3"
      style={{
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {notifications.map((notification) => (
        <NotificationView
          key={notification.key}
          notification={notification}
          onCompleted={() =>
            shell.notificationManager.hideNotification(notification.key)
          }
        />
      ))}
    </div>
  );
}

export default NotificationContainer;
