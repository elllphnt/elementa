import type { StyleModifierData } from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { StyleManager } from "@elllphnt/elementa-models";
import {
  useManyObservables,
  useObservable,
} from "@elllphnt/elementa-react-utils";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import type { FrameHandle } from "~/handles/renderables/frame.js";
import { AutoSizeInput } from "../autosize_input.js";
import { useElementaInteractor } from "../hooks/elementa_interactor.js";
import { useHandleDom } from "./_hooks/interaction_target.js";
import { RenderableContentHandleComponent } from "./content.js";

const frameIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 1H3V3H1L1 4H3V8H1L1 9H3V11H4V9H8V11H9V9H11V8H9V4H11V3H9V1H8V3L4 3V1ZM8 8V4L4 4V8L8 8Z"
      fill="currentColor"
    />
  </svg>
);
const fragmentIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 1H2H4V2L2 2V4H1V2V1ZM10 1H8V2L10 2V4H11V2V1H10ZM4 11V10H2V8H1V10V11H2H4ZM11 11H10H8V10H10V8H11V10V11ZM4 4H8V8H4V4ZM3 3H4H8H9V4V8V9H8H4H3V8V4V3Z"
      fill="currentColor"
    />
  </svg>
);

function Label({ frame }: { frame: FrameHandle }) {
  const { addInteractionTarget } = useHandleDom(frame);
  const name = useObservable(
    frame.renderable.instance.model.name$,
    frame.renderable.instance.model.name
  );
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDoubleClick = () => {
    if (editable) return;
    setEditable(true);
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
  };

  return (
    <div
      ref={addInteractionTarget}
      style={{
        pointerEvents: "auto",
        cursor: editable ? "text" : "",
        maxWidth: "100%",
        display: "flex",
        gap: 4,
        alignItems: "center",
        overflow: "hidden",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{ height: 12, width: 12 }}>{frameIcon}</div>
      <AutoSizeInput
        style={{ pointerEvents: editable ? "auto" : "none", maxWidth: "100%" }}
        placeholder="frame"
        value={name ?? ""}
        onChange={(e) =>
          frame.renderable.instance.model.setName(e.target.value)
        }
        inputProps={{
          ref: (i) => {
            inputRef.current = i;
          },
          onBlur: () => setEditable(false),
          onKeyDown: (e) => e.key === "Enter" && e.currentTarget.blur(),
          style: {
            background: "none",
            outline: "none",
            border: "none",
            color: "inherit",
            font: "inherit",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            padding: 0,
          },
        }}
      />
    </div>
  );
}

function ViewportIndicator({
  frame,
  isHeight,
}: {
  frame: FrameHandle;
  isHeight: boolean;
}) {
  const editor = useElementaInteractor();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      frame.renderable.instance.model.context.viewport.height$,
      frame.renderable.instance.model.context.viewport.width$,
      editor.stage.viewport.scale$,
      frame.selected$,
      frame.contentRect$,
    ]).subscribe(([viewportHeight, viewportWidth, scale, selected, rect]) => {
      if (!ref.current) return;
      const viewportSize = isHeight ? viewportHeight : viewportWidth;
      const rectSize = isHeight ? rect.height : rect.width;
      const transform = isHeight
        ? `translateY(${(viewportHeight || 0) * scale}px)`
        : `translateX(${(viewportWidth || 0) * scale}px)`;
      const size = isHeight
        ? Math.min(viewportWidth || 0, rect.width) * scale
        : Math.min(viewportHeight || 0, rect.height) * scale;

      if (!viewportSize || !scale || !rect || viewportSize >= rectSize - 2) {
        ref.current.style.display = "none";
      } else {
        ref.current.style.display = "block";
        ref.current.style.transform = transform;
        ref.current.style[isHeight ? "width" : "height"] = `${size}px`;
        ref.current.style.borderColor = selected ? "#08f" : "#5555";
      }
    });

    return () => subscription.unsubscribe();
  }, [editor, isHeight]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: isHeight ? 0 : undefined,
        left: isHeight ? undefined : 0,
        borderBottom: isHeight ? "1px dashed transparent" : undefined,
        borderRight: isHeight ? undefined : "1px dashed #08f",
      }}
    />
  );
}

function SelectorText({
  modifiers,
  styleManager,
}: {
  modifiers: StyleModifierData[];
  styleManager: StyleManager;
}) {
  const selector = useManyObservables(
    modifiers.map((modifier) => styleManager.modifierToClassName$(modifier)),
    modifiers.map((modifier) => styleManager.modifierToClassName(modifier)),
    JSON.stringify(modifiers)
  ).join(":");

  return (
    <span
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      {selector}
    </span>
  );
}

function StyleModifiersIndicator({ frame }: { frame: FrameHandle }) {
  const modifiers = useObservable(
    frame.model.context.styleModifiers$,
    frame.model.context.styleModifiers
  );

  if (!modifiers?.length)
    return (
      <div
        className="elementa-style-modifiers-indicator"
        style={{
          opacity: 0.5,
          fontStyle: "italic",
        }}
      >
        base
      </div>
    );

  return (
    <div className="elementa-style-modifiers-indicator active">
      <SelectorText
        modifiers={modifiers}
        styleManager={frame.model.stage.environment.project.styleManager}
      />
    </div>
  );
}

export function FrameHandleComponent({ frame }: { frame: FrameHandle }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(frame);
  const content = useObservable(frame.content$, frame.content);
  // const element = useObservable(
  //   frame.renderable.htmlElement$(Renderable.defaultHtmlElementKey),
  //   frame.renderable.htmlElement(Renderable.defaultHtmlElementKey)
  // );

  // activate interaction target when dropping or the active tool is of type entity
  // useEffect(() => {
  //   const subscription = combineLatest([
  //     frame.interactor.flag$("dropping").pipe(distinctUntilChanged()),
  //     frame.interactor.toolManager.tool$.pipe(
  //       map((tool) => tool instanceof EntityTool),
  //       distinctUntilChanged()
  //     ),
  //   ]).subscribe(([dropping, entityTool]) => {
  //     const root = rootRef.current;
  //     if (!root) return;

  //     if (dropping || entityTool) {
  //       root.style.pointerEvents = "auto";
  //     } else {
  //       root.style.pointerEvents = "none";
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, [frame]);

  return (
    <>
      <div
        className={cx("elementa-handle elementa-handle-frame")}
        ref={(element) => {
          setRectHtmlElement(element);
          addInteractionTarget(element);
          rootRef.current = element;
        }}
      >
        <div
          className="elementa-handle-label"
          style={{
            position: "absolute",
            top: -4,
            left: 0,
            right: 0,
            transform: "translateY(-100%)",
            display: "flex",
            gap: 4,
            justifyContent: "space-between",
            overflow: "hidden",
            alignItems: "end",
          }}
        >
          <Label frame={frame} />
          <StyleModifiersIndicator frame={frame} />
        </div>
        <ViewportIndicator frame={frame} isHeight={true} />
        <ViewportIndicator frame={frame} isHeight={false} />
      </div>
      {content ? <RenderableContentHandleComponent content={content} /> : <></>}
    </>
  );
}
