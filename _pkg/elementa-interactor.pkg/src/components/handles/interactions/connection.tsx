import { EdgeName } from "@elllphnt/elll-element";
import { PortRole } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import { useEffect, useRef } from "react";
import { ConnectionHandle } from "~/src/handles/connection";
import { Handle } from "~/src/handles/handle";
import { MouseInteraction } from "~/src/tools/interactions/mouse";

const portSize = 9;

export function PortComponent({
  placement,
  handle,
}: {
  placement: EdgeName;
  handle: Handle;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const style: any = {
    position: "absolute",
    zIndex: 1,
    height: portSize,
    width: portSize,
  };

  switch (placement) {
    case "top":
      style.left = `calc(50% - ${portSize / 2}px)`;
      style.top = `-${portSize / 2}px`;
      break;
    case "right":
      style.right = `-${portSize / 2}px`;
      style.top = `calc(50% - ${portSize / 2}px)`;
      break;
    case "bottom":
      style.left = `calc(50% - ${portSize / 2}px)`;
      style.bottom = `-${portSize / 2}px`;
      break;
    case "left":
      style.left = `-${portSize / 2}px`;
      style.top = `calc(50% - ${portSize / 2}px)`;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const mouseInteraction = new MouseInteraction();
    mouseInteraction.on("start", () => {
      const connection = new ConnectionHandle({
        interactor: handle.interactor,
        component: handle.entity.component,
      });

      if (
        handle instanceof PortHandle &&
        handle.role === PortRole.Input &&
        handle.sourceConnection
      ) {
        if (handle.sourceConnection.start === handle) {
          connection.setStart(handle.sourceConnection.end);
        } else {
          connection.setStart(handle.sourceConnection.start);
        }
        handle.disconnect();
      } else {
        connection.setStart(handle);
      }

      const startHandle = connection.start as Handle;

      const sub = mouseInteraction.endPosition$.subscribe((endPosition) => {
        const contentPosition =
          handle.interactor.stager.viewport.windowToContent(endPosition);

        const hovered = handle.interactor.interactionManager.hovered;

        if (hovered && hovered !== startHandle) {
          if (
            hovered.allowedPortPlacements.length &&
            (hovered.canConnect(startHandle) || startHandle.canConnect(hovered))
          ) {
            connection.setEnd(hovered);
            return;
          }
        }

        connection.setEnd({
          x: contentPosition.x,
          y: contentPosition.y,
        });
      });

      handle.interactor.interactionManager.startConnection(connection);

      mouseInteraction.on("stop", () => {
        const end = connection.end;
        handle.interactor.interactionManager.endConnection();
        connection.dispose();

        if (end instanceof Handle) {
          let connection: ConnectionHandle | undefined;
          if (startHandle.canConnect(end)) {
            connection = startHandle.connect(end);
          } else if (end.canConnect(startHandle)) {
            connection = end.connect(startHandle);
          }
          connection?.select();
        } else {
          const options = startHandle.getConnectionOptions(end);
          if (options.length) {
            const viewportPosition = mouseInteraction.endPosition;
            startHandle.interactor.host.showContextMenu(
              viewportPosition,
              options,
            );
          }
        }

        mouseInteraction.dispose();
        sub.unsubscribe();
      });
    });

    mouseInteraction.run(
      window,
      handle.interactor.stager.viewport.windowToContent({
        x: e.clientX,
        y: e.clientY,
      }),
    );
  };

  return (
    <div
      className="element-port"
      ref={(r) => {
        ref.current = r;
      }}
      style={style}
      onMouseDown={handleMouseDown}
    />
  );
}
export function ConnectionHandleComponent({ handle }: { handle: Handle }) {
  const ref = useRef<HTMLDivElement>(null);
  const allowedPortPlacements = handle.allowedPortPlacements;

  useEffect(() => {
    const rectSubscription = handle.interfaceRect$.subscribe((rect) => {
      const htmlElement = ref.current;
      if (!htmlElement) return;

      if (!rect || (rect.width === 0 && rect.height === 0)) {
        htmlElement.style.display = "none";
      } else {
        htmlElement.style.display = "block";
        htmlElement.style.left = `${rect.x}px`;
        htmlElement.style.top = `${rect.y}px`;
        htmlElement.style.width = `${rect.width}px`;
        htmlElement.style.height = `${rect.height}px`;
      }
    });

    return () => {
      rectSubscription.unsubscribe();
    };
  }, []);

  let subHandles: JSX.Element[] = [];
  if (handle instanceof ControllerWidgetHandle) {
    subHandles.push(
      <ControllerWidgetEntriesConnectionHandle
        key={handle.key}
        handle={handle}
      />,
    );
  }

  return (
    <>
      <div className="elementa-connection-handle" ref={ref}>
        {allowedPortPlacements.map((placement) => (
          <PortComponent
            key={placement}
            placement={placement}
            handle={handle}
          />
        ))}
      </div>
      {subHandles}
    </>
  );
}
export function ControllerWidgetEntriesConnectionHandle({
  handle,
}: {
  handle: ControllerWidgetHandle;
}) {
  const ports = useObservable(handle.ports$, handle.ports);

  return (
    <>
      {ports.map((port) => (
        <ConnectionHandleComponent key={port.key} handle={port} />
      ))}
    </>
  );
}
