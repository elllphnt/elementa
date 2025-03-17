import { elllIcons16, Icon, Tooltip } from "@repo/components";
import {
  ElementaInteractorContext,
  tools,
  useElementaInteractor,
} from "@repo/elementa-interactor";
import { useFocusNode } from "@repo/shell";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useEffect, useMemo } from "react";
import { map } from "rxjs";
import { useElementaRenderer } from "~/src/components/modules/elementa/elementa_viewer";
import { ElementaEditorState } from "~/src/editors/elementa/editor";
import { stagerTheme } from "~/src/editors/elementa/libs/theme";
import { useElll } from "~/src/hooks/elll/elll";
import { useColorScheme } from "~/src/hooks/utils/color_scheme";
import { ElementaInteractorComponent } from "../../../../../../../elementa-interactor.pkg/dist";

type ToolData = {
  name: string;
  icon: string;
  tool: string;
};
const toolData: ToolData[] = [
  {
    name: "Select",
    icon: elllIcons16.toolSelect,
    tool: tools.Select.name,
  },
  {
    name: "Frame",
    icon: elllIcons16.toolWidget,
    tool: tools.Frame.name,
  },
  {
    name: "Container",
    icon: elllIcons16.toolElement,
    tool: tools.Container.name,
  },
  {
    name: "Container Filled",
    icon: elllIcons16.containerFilled,
    tool: tools.ContainerFilled.name,
  },
  {
    name: "Slot",
    icon: elllIcons16.allCorner,
    tool: tools.Slot.name,
  },
  {
    name: "Text",
    icon: elllIcons16.toolText,
    tool: tools.Text.name,
  },
  {
    name: "Vector",
    icon: elllIcons16.vector,
    tool: tools.Vector.name,
  },
  {
    name: "Media",
    icon: elllIcons16.image,
    tool: tools.Media.name,
  },
];

function ToolButton({ data }: { data: ToolData }) {
  const editor = useElementaInteractor();
  const active$ = useMemo(() => {
    return editor?.toolManager.tool$.pipe(map((t) => t.name === data.tool));
  }, []);
  const active = useObservable(active$, false);
  const colorScheme = useColorScheme();

  return (
    <Tooltip content={data.name} side="right" delayDuration={0} sideOffset={4}>
      <button
        onClick={() => {
          editor?.toolManager.setTool(data.tool);
        }}
        className={cx("el-h-5 el-w-5 el-rounded-sm", {
          "el-bg-pm el-text-pm-ctr": active,
        })}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "auto",
          background: active
            ? ""
            : colorScheme === "dark"
              ? stagerTheme.dark.backgroundColor
              : stagerTheme.light.backgroundColor,
        }}
      >
        <Icon name={data.icon} className={"el-h-4 el-w-4"} />
      </button>
    </Tooltip>
  );
}

function Toolbar() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toolData.map((tool) => (
        <ToolButton key={tool.name} data={tool} />
      ))}
    </div>
  );
}

export function ComponentBoardView({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const elll = useElll();
  const { focused, setRef } = useFocusNode(`elementa-editor-${editor.id}`);
  const ref = useElementaRenderer({ editor });
  const interactor = useObservable(
    editor.elementaInteractor$,
    editor.elementaInteractor,
  );

  let interactorElement: JSX.Element = <></>;

  if (interactor) {
    interactorElement = (
      <ElementaInteractorContext.Provider value={interactor}>
        <ElementaInteractorComponent interactor={interactor} />
        <div className="el-absolute el-top-2 el-left-2">
          <Toolbar />
        </div>
      </ElementaInteractorContext.Provider>
    );
  }

  // keyboard event
  useEffect(() => {
    if (!focused) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (editor.active) {
        editor.elementaInteractor?.keyboardManager.handleKeyDown(e);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (editor.active) {
        editor.elementaInteractor?.keyboardManager.handleKeyUp(e);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [editor, focused]);

  return (
    <div
      key={editor.id}
      ref={(e) => {
        ref.current = e;
        setRef(e);
      }}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        pointerEvents: "auto",
      }}
    >
      {interactorElement}
    </div>
  );
}
