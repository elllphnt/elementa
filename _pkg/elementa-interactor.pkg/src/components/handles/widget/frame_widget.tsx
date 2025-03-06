import { fragmentVariants } from "@repo/elementa-models";
import { combineLatestOrEmpty, useObservable } from "@repo/utils";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { FrameWidgetHandle } from "~/src/handles/_";
import { EntityTool } from "~/src/tools/entity";
import { useElementaInteractor } from "../../../hooks/elementa_interactor";
import { AutoSizeInput } from "../../autosize_input";
import { useHandleDom } from "../_hooks/interaction_target";
import { FragmentHandleComponent } from "../fragment";

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

const iconMap: Record<string, JSX.Element> = {
  [fragmentVariants.fragment]: fragmentIcon,
  [fragmentVariants.template]: frameIcon,
};

function Label({ widget }: { widget: FrameWidgetHandle }) {
  const { addInteractionTarget } = useHandleDom(widget);
  const name = useObservable(
    widget.renderable.instance.entity.name$,
    widget.renderable.instance.entity.name,
  );
  const fragment = useObservable(widget.fragment$, widget.fragment);
  const fragmentName = useObservable(
    fragment?.entity.name$,
    fragment?.entity.name,
  );
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const icon = fragment ? iconMap[fragment.entity.variant] : <></>;

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
      className="elementa-handle-label"
      onDoubleClick={handleDoubleClick}
    >
      <div style={{ height: 12, width: 12 }}>{icon}</div>
      <AutoSizeInput
        style={{ pointerEvents: editable ? "auto" : "none", maxWidth: "100%" }}
        placeholder={fragmentName || "fragment"}
        value={name ?? ""}
        onChange={(e) =>
          widget.renderable.instance.entity.setName(e.target.value)
        }
        inputProps={{
          ref: (i) => (inputRef.current = i),
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
  frame: FrameWidgetHandle;
  isHeight: boolean;
}) {
  const editor = useElementaInteractor();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      frame.renderable.instance.entity.viewportHeight$,
      frame.renderable.instance.entity.viewportWidth$,
      editor.stager.viewport.scale$,
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

export function FrameWidgetHandleComponent({
  widget,
}: {
  widget: FrameWidgetHandle;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(widget);
  const fragment = useObservable(widget.fragment$, widget.fragment);

  // activate interaction target when dropping or the active tool is of type entity
  useEffect(() => {
    const subscription = combineLatest([
      widget.interactor.flag$("dropping").pipe(distinctUntilChanged()),
      widget.interactor.toolManager.tool$.pipe(
        map((tool) => tool instanceof EntityTool),
        distinctUntilChanged(),
      ),
    ]).subscribe(([dragging, entityTool]) => {
      const root = rootRef.current;
      if (!root) return;

      if (dragging || entityTool) {
        root.style.pointerEvents = "auto";
      } else {
        root.style.pointerEvents = "none";
      }
    });

    return () => subscription.unsubscribe();
  }, [widget]);

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
          <Label widget={widget} />
        </div>
        <ViewportIndicator frame={widget} isHeight={true} />
        <ViewportIndicator frame={widget} isHeight={false} />
      </div>
      {fragment ? (
        <FragmentHandleComponent key={fragment.key} fragment={fragment} />
      ) : null}
    </>
  );
}
