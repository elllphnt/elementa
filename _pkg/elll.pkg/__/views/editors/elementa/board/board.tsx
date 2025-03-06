import { elllIcons16, Icon, Tooltip } from "@repo/components";
import {
  ElementaEditorContext,
  ElementaEditorMode,
  tools,
  useEditorMode,
  useElementaEditor,
} from "@repo/elementa";
import { pairwiseOrEmpty, useObservable } from "@repo/utils";
import cx from "classnames";
import { useEffect, useMemo, useRef } from "react";
import { map } from "rxjs";
import { ElementaEditorState } from "../../../../editors/elementa/elementa";
import { useColorScheme } from "../../../../hooks/utils/color_scheme";
import { FloatingMenu } from "./floating_menu";

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
  const editor = useElementaEditor();
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
              ? editor.theme.dark.background
              : editor.theme.light.background,
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

function ModeButton() {
  const [mode, setMode] = useEditorMode();

  return (
    <button
      onClick={() => {
        if (mode === "flow") {
          setMode(ElementaEditorMode.Design);
        } else {
          setMode(ElementaEditorMode.Flow);
        }
      }}
      style={{
        textTransform: "uppercase",
        fontSize: 10,
        padding: "2px 8px",
      }}
      className="el-rounded el-bg-bg-900/10 hover:el-bg-bg-900/20"
    >
      {mode}
    </button>
  );
}

export function ElementaEditorBoardView({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const elementaEditor = useObservable(
    editor.elementaEditor$,
    editor.elementaEditor,
  );

  // add event listeners to elementa's window to repeat them
  // in the parent window
  useEffect(() => {
    if (!elementaEditor) return;

    const repeatMouseEvent = (e: MouseEvent) => {
      ref.current?.dispatchEvent(
        new MouseEvent(e.type, {
          ...e,
          bubbles: true,
        }),
      );
    };

    const subscription = elementaEditor.window$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev) {
          prev.removeEventListener("mousedown", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("mouseup", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("mouseenter", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("mouseleave", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("mouseover", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("click", repeatMouseEvent, {
            capture: true,
          });
        }
        if (next) {
          next.addEventListener("mousedown", repeatMouseEvent, {
            capture: true,
          });
          next.addEventListener("mouseup", repeatMouseEvent, { capture: true });
          next.addEventListener("mouseenter", repeatMouseEvent, {
            capture: true,
          });
          next.addEventListener("mouseleave", repeatMouseEvent, {
            capture: true,
          });
          next.addEventListener("mouseover", repeatMouseEvent, {
            capture: true,
          });
          next.addEventListener("click", repeatMouseEvent, { capture: true });
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [elementaEditor]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    editor.mount(container);
    return () => {
      editor.unmount();
    };
  }, [editor]);

  // add keybaord listeners
  // useEffect(() => {
  //   if (editor !== activeEditor) return;
  //   const elementaEditor = editor.elementaEditor;

  //   const onKeyDown = (e: KeyboardEvent) => {
  //     elementaEditor.handleKeyDown(e);
  //   };
  //   const onKeyUp = (e: KeyboardEvent) => {
  //     elementaEditor.handleKeyUp(e);
  //   };

  //   window.addEventListener("keydown", onKeyDown);
  //   window.addEventListener("keyup", onKeyUp);

  //   return () => {
  //     window.removeEventListener("keydown", onKeyDown);
  //     window.removeEventListener("keyup", onKeyUp);
  //   };
  // }, [editor, activeEditor]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
        }}
        ref={ref}
      />
      {elementaEditor ? (
        <ElementaEditorContext.Provider value={elementaEditor}>
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
            }}
          >
            <Toolbar />
          </div>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              pointerEvents: "auto",
            }}
          >
            <ModeButton />
          </div>

          <FloatingMenu />
        </ElementaEditorContext.Provider>
      ) : (
        <></>
      )}
    </div>
  );
}
