import cx from "classnames";
import { ConnectionHandle } from "../../handles/connection";
import { useHandleDom } from "./_hooks/interaction_target";

export function EdgeComponent({
  edge,
  active,
}: {
  edge: ConnectionHandle;
  active?: boolean;
}) {
  const { addInteractionTarget } = useHandleDom(edge);

  return (
    <svg
      id={edge.id}
      className="elementa-edge"
      style={{
        position: "absolute",
        fill: "none",
      }}
      overflow={"visible"}
      ref={(e) => {
        edge.renderable.setHtmlElement(e as any);
      }}
    >
      <path
        style={{
          pointerEvents: "all",
        }}
        ref={(e) => {
          edge.renderable.setHtmlElement("handle", e as any);
          addInteractionTarget(e as any);
        }}
        stroke="transparent"
        strokeWidth={8}
      />
      <path
        className={cx("elementa-edge-stroke", { active })}
        ref={(e) => {
          edge.renderable.setHtmlElement("stroke", e as any);
        }}
      />
      <path
        className={cx("elementa-edge-fill", { active })}
        ref={(e) => {
          edge.renderable.setHtmlElement("fill", e as any);
        }}
      />
      <circle
        r={2}
        className="elementa-edge-edge"
        ref={(e) => {
          edge.renderable.setHtmlElement("start", e as any);
        }}
      />
      <circle
        r={2}
        className="elementa-edge-edge"
        ref={(e) => {
          edge.renderable.setHtmlElement("end", e as any);
        }}
      />
    </svg>
  );
}
