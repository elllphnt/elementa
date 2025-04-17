import { TreeEntry } from "@repo/components";
import { useObservable } from "@repo/utils";
import { ReactNode, useEffect, useState } from "react";
import { BlueprintEditor, Rect } from "~/src/editors/blueprint/editor";

export function MenuContent({
  editor,
  routeId,
  rect,
}: {
  rect: Rect;
  editor: BlueprintEditor;
  routeId: string;
}) {
  const route = useObservable(editor.route$(routeId), editor.route(routeId));
  const data = useObservable(route?.data$, route?.data);

  const viewEntries: ReactNode[] = [];
  const moduleEntries: ReactNode[] = [];

  // page entries
  if (data?.handlerUrl === undefined) {
    if (data?.mainViewUrl === undefined) {
      viewEntries.push(
        <TreeEntry
          key="main"
          onClick={() => {
            route?.update({
              mainViewUrl: "",
            });
          }}
        >
          Add Main View
        </TreeEntry>,
      );
    }
    if (data?.pendingViewUrl === undefined) {
      viewEntries.push(
        <TreeEntry
          key="pending"
          onClick={() => {
            route?.update({
              pendingViewUrl: "",
            });
          }}
        >
          Add Pending View
        </TreeEntry>,
      );
    }
    if (data?.errorViewUrl === undefined) {
      viewEntries.push(
        <TreeEntry
          key="error"
          onClick={() => {
            route?.update({
              errorViewUrl: "",
            });
          }}
        >
          Add Error View
        </TreeEntry>,
      );
    }
    if (data?.notFoundViewUrl === undefined) {
      viewEntries.push(
        <TreeEntry
          key="notFound"
          onClick={() => {
            route?.update({
              notFoundViewUrl: "",
            });
          }}
        >
          Add Not Found View
        </TreeEntry>,
      );
    }
    if (data?.loaderUrl === undefined) {
      viewEntries.push(
        <TreeEntry
          key="loader"
          onClick={() => {
            route?.update({
              loaderUrl: "",
            });
          }}
        >
          Add Loader
        </TreeEntry>,
      );
    }
  }
  // handler entries
  if (
    data?.mainViewUrl === undefined &&
    data?.errorViewUrl === undefined &&
    data?.pendingViewUrl === undefined &&
    data?.notFoundViewUrl === undefined &&
    data?.loaderUrl === undefined
  ) {
    if (data?.handlerUrl === undefined) {
      moduleEntries.push(
        <TreeEntry
          key="handle"
          onClick={() => {
            route?.update({
              handlerUrl: "",
            });
          }}
        >
          Add Handler
        </TreeEntry>,
      );
    }
  }

  if (viewEntries.length) {
    viewEntries.push(<hr key="view-hr" />);
  }
  if (moduleEntries.length) {
    moduleEntries.push(<hr key="module-hr" />);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x + rect.width + 8,
        top: rect.y,
        width: 200,
      }}
      className="el-bg-bg el-border el-rounded-md el-shadow-md el-p-1 el-space-y-1"
    >
      {viewEntries}
      {moduleEntries}
      <TreeEntry
        onClick={() => {
          const deleted = route?.app.removeRoutes([routeId]);
          deleted?.forEach((route) => route.dispose());
          editor.setNodeMenuId(undefined);
        }}
      >
        Delete this route
      </TreeEntry>
    </div>
  );
}
export function Menu({ editor }: { editor: BlueprintEditor }) {
  const nodeMenuId = useObservable(editor.nodeMenuId$, editor.nodeMenuId);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (nodeMenuId) {
      const rect = editor.getNodeViewportRect(nodeMenuId);
      if (rect) {
        setRect(rect);
      }
    } else {
      setRect(null);
    }
  }, [nodeMenuId]);

  if (!rect || !nodeMenuId) {
    return <></>;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
      onClick={(e) => {
        e.stopPropagation();
        editor.setNodeMenuId(undefined);
      }}
    >
      <MenuContent rect={rect} editor={editor} routeId={nodeMenuId} />
    </div>
  );
}
