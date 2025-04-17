// src/components/RouteNode.tsx
import { isElllResourceUrl } from "@repo/backend";
import { elllIcons16, Icon, IconButton, TreeEntry } from "@repo/components";
import { Route } from "@repo/elementa-models";
import { useDrop } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import cx from "classnames";
import React, {
  ChangeEventHandler,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { BlueprintEditor } from "~/src/editors/blueprint/editor";
import { useElll } from "~/src/hooks/elll/elll";
import { useElllProject } from "~/src/hooks/project/project";
import { mimeTypes } from "~/src/libs/mimetypes";
import { makeAbsoluteElllFileUrl, makeRelativeFileUrl } from "~/src/libs/url";
import { getElllWorkspaceElementaProject } from "~/src/modules/elementa/project/_lib";

export function AutoSizeInput({
  value,
  placeholder,
  onChange,
  style,
  inputProps,
  ...props
}: {
  value?: string;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  inputProps?: JSX.IntrinsicElements["input"];
} & Omit<JSX.IntrinsicElements["div"], "onChange">) {
  const { style: inputStyle, ..._inputProps } = inputProps ?? {};

  return (
    <div
      style={{
        position: "relative",
        height: "1.2em",
        ...style,
      }}
      {...props}
    >
      <span
        style={{
          opacity: 0,
        }}
      >
        {value || placeholder}
      </span>
      <input
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: 0,
          margin: 0,
          border: "none",
          outline: "none",
          background: "none",
          font: "inherit",
          color: "inherit",
          lineHeight: "inherit",
          ...inputStyle,
        }}
        {..._inputProps}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
}

const RouteNodeHeader = memo(function RouteNodeHeader({
  route,
  onShowAddMenu,
}: {
  route: Route;
  onShowAddMenu: () => void;
}) {
  const routeData = useObservable(route.data$, route.data);
  const actionButtons: {
    key: string;
    icon: string;
    handler: () => void;
  }[] = [];

  return (
    <div
      className={cx(
        "el-w-full el-flex el-items-center el-justify-between el-gap-1 el-rounded el-p-1",
        {
          "el-bg-bg": routeData.path,
          "el-bg-bg/50": !routeData.path,
        },
      )}
    >
      <div className="el-px-1">
        <AutoSizeInput
          className={cx("", {
            "el-font-semibold": routeData.path,
            "el-italic": !routeData.path,
          })}
          placeholder="pathless"
          value={routeData.path}
          onChange={(e) => {
            route.update({
              path: e.target.value,
            });
          }}
        />
      </div>
      <IconButton
        icon={elllIcons16.plus}
        onClick={(e) => {
          e.stopPropagation();
          onShowAddMenu();
        }}
      />
    </div>
  );
});

function RouteSlotFillName({ value }: { value: string }) {
  const project = useElllProject();
  const bleuprintModel = useObservable(
    project.blueprint.model$,
    project.blueprint.model,
  );

  const absoluteUrl =
    value && bleuprintModel?.url
      ? makeAbsoluteElllFileUrl(bleuprintModel?.url, value)
      : "";
  const fileName = useObservable(
    project.infrastructure.fileSystem.fileName$(absoluteUrl),
    project.infrastructure.fileSystem.fileName(absoluteUrl),
  );

  return <span>{fileName}</span>;
}
function RouteSlot({
  icon,
  label,
  value,
  onChange,
  allowedFileTypes,
}: {
  icon?: string;
  label?: string;
  value?: string;
  onChange?: (value?: string) => void;
  allowedFileTypes?: string[];
}) {
  const elll = useElll();
  const project = useElllProject();
  const bleuprintModel = useObservable(
    project.blueprint.model$,
    project.blueprint.model,
  );

  const absoluteUrl =
    value && bleuprintModel?.url
      ? makeAbsoluteElllFileUrl(bleuprintModel?.url, value)
      : "";
  // const fileName = useObservable(
  //   project.infrastructure.fileSystem.fileName$(absoluteUrl),
  //   project.infrastructure.fileSystem.fileName(absoluteUrl),
  // );

  const [ref] = useDrop(
    {
      acceptDrop: (event, data) => {
        // const uris =
        //   event.dataTransfer?.getData(mimeTypes.uriList) ||
        //   (data?.[mimeTypes.uriList] as string | undefined);
        // if (!uris) {
        //   return false;
        // }
        // const uri = uris.split("\n")[0];
        // // only accept elll resource urls
        // if (!isElllResourceUrl(uri)) {
        //   return false;
        // }
        // // only accept file resource type
        // const { id } = parseElllResourceUrl(uri);
        // const { entity_name } = parseEntityId(id) ?? {};
        // if (
        //   !entity_name ||
        //   ![elllEntities.commitFile.name, elllEntities.workspaceFile].includes(
        //     entity_name as any,
        //   )
        // ) {
        //   return false;
        // }
        // const droppingFile = backend.instance<File>(id);
        // // ignore if dropping file is not found or file type is not defined
        // if (!droppingFile || !droppingFile.type) {
        //   return false;
        // }

        // // only accept file type
        // if (
        //   allowedFileTypes?.length &&
        //   !allowedFileTypes.includes(droppingFile.type)
        // ) {
        //   return false;
        // }

        return true;
      },
      handleDrop: (event, data) => {
        const project = getElllWorkspaceElementaProject(elll);
        const blueprintUrl = project?.blueprint.model?.url;
        if (!blueprintUrl) return;

        const uris =
          event.dataTransfer?.getData(mimeTypes.uriList) ||
          (data?.[mimeTypes.uriList] as string | undefined);
        if (!uris) {
          return;
        }
        const uri = uris.split("\n")[0];
        // only accept elll resource urls
        if (!uri || !isElllResourceUrl(uri)) {
          return;
        }
        const url = makeRelativeFileUrl(blueprintUrl, uri);
        onChange?.(url);
      },
    },
    [],
  );

  return (
    <TreeEntry
      ref={ref}
      style={{
        border: !value ? "1px dashed currentColor" : "none",
        fontStyle: !value ? "italic" : "normal",
        color: !value
          ? "color-mix(in srgb, currentColor 30%, transparent)"
          : "inherit",
      }}
      onClick={() => {
        if (onChange) {
          onChange(value || "");
        }
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            onChange?.(undefined);
          },
        },
      ]}
      prefix={<div className="el-w-1" />}
      icon={<Icon name={icon} className="el-h-4 el-w-4" />}
    >
      {value ? <RouteSlotFillName value={value} /> : label}
    </TreeEntry>
  );
}

const RouteNodeBody = memo(function RouteNodeBody({
  editor,
  route,
}: {
  editor: BlueprintEditor;
  route: Route;
}) {
  const routeData = useObservable(route.data$, route.data);
  const entries: React.ReactNode[] = [];

  // views

  if (routeData.mainViewUrl !== undefined) {
    entries.push(
      <RouteSlot
        key="main-view"
        label="Main View"
        value={routeData.mainViewUrl}
        icon={elllIcons16.component}
        onChange={(value) => {
          route.update({
            mainViewUrl: value,
          });
        }}
      />,
    );
  }
  if (routeData.pendingViewUrl !== undefined) {
    entries.push(
      <RouteSlot
        key="pending-view"
        label="Pending View"
        value={routeData.pendingViewUrl}
        icon={elllIcons16.pending}
        onChange={(value) => {
          route.update({
            pendingViewUrl: value,
          });
        }}
      />,
    );
  }
  if (routeData.notFoundViewUrl !== undefined) {
    entries.push(
      <RouteSlot
        key="not-found-view"
        label="Not Found View"
        value={routeData.notFoundViewUrl}
        icon={elllIcons16.notFound}
        onChange={(value) => {
          route.update({
            notFoundViewUrl: value,
          });
        }}
      />,
    );
  }
  if (routeData.errorViewUrl !== undefined) {
    entries.push(
      <RouteSlot
        key="error-view"
        label="Error View"
        value={routeData.errorViewUrl}
        icon={elllIcons16.error}
        onChange={(value) => {
          route.update({
            errorViewUrl: value,
          });
        }}
      />,
    );
  }

  // logics

  if (routeData.loaderUrl !== undefined) {
    entries.push(
      <RouteSlot
        key="loader"
        label="Loader"
        value={routeData.loaderUrl}
        icon={elllIcons16.loader}
        onChange={(value) => {
          route.update({
            loaderUrl: value,
          });
        }}
      />,
    );
  }
  if (routeData.handlerUrl !== undefined) {
    entries.push(
      <RouteSlot
        key="handler"
        label="Handler"
        value={routeData.handlerUrl}
        icon={elllIcons16.routine}
        onChange={(value) => {
          route.update({
            handlerUrl: value,
          });
        }}
      />,
    );
  }

  if (!entries.length) {
    return <></>;
  }

  return <div className="el-flex el-flex-col el-gap-1">{entries}</div>;
});

function RouteNode({
  id,
  data: { editor, route },
}: NodeProps<
  Node<{
    editor: BlueprintEditor;
    route: Route;
  }>
>) {
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = useObservable(
    editor.isNodeSelected$(id),
    editor.isNodeSelected(id),
  );

  useLayoutEffect(() => {
    if (ref.current) {
      editor.setNodeDom(id, ref.current);
    }
    return () => {
      editor.setNodeDom(id, undefined);
    };
  }, [editor]);

  const handleShowAddMenu = useCallback(() => {
    editor.setNodeMenuId(id);
  }, [editor, id]);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        editor.select({ nodes: [id] }, e.shiftKey);
      }}
      style={{
        width: 180,
      }}
      className={cx(
        "el-relative el-bg-bg-200 el-rounded-md el-text-xs el-shadow el-flex el-flex-col el-gap-0.5 el-p-0.5",
        {
          "el-outline el-outline-2 el-outline-pm": isSelected,
        },
      )}
    >
      <RouteNodeHeader route={route} onShowAddMenu={handleShowAddMenu} />
      <RouteNodeBody route={route} editor={editor} />
      <Handle
        type="target"
        position={Position.Top}
        className="el-bg-gray-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="el-bg-gray-600"
      />
    </div>
  );
}

export default React.memo(RouteNode); // Memoize for performance
