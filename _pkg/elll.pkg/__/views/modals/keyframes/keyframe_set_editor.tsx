import {
  ColumnControlContainer,
  ControlMenuAffinityProvider,
  FullControlEntry,
  ScrollArea,
  SpinnerControl,
} from "@repo/components";
import { Keyframe, KeyFrameSet } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import React, { useState } from "react";
import {
  appearancesStylePropertyControls,
  boxStylePropertyControls,
  layoutStylePropertyControls,
  positionStylePropertyControls,
  StylePropertyGroupConfig,
  textStylePropertyControls,
  transformStylePropertyControls,
} from "../../../components/controls/styles/properties";
import { Sheet } from "../../../components/sheet/sheet";
import { useProjectKeyframeSet } from "../../../hooks/project/keyframe_set";
import { StyleEffectsControlSheet } from "../../sheets/elementa/style/effects";
import { StylePropertiesControlSheet } from "../../sheets/elementa/style/style_properties";

const sections: Array<{
  title: string;
  properties: Array<StylePropertyGroupConfig>;
}> = [
  {
    title: "Position",
    properties: positionStylePropertyControls,
  },
  {
    title: "Box",
    properties: boxStylePropertyControls,
  },
  {
    title: "Layout",
    properties: layoutStylePropertyControls,
  },
  {
    title: "Text",
    properties: textStylePropertyControls,
  },
  {
    title: "Appearance",
    properties: appearancesStylePropertyControls,
  },
  {
    title: "Transform",
    properties: transformStylePropertyControls,
  },
];

const KeyframeHandle = ({
  keyframe,
  active,
  onClick,
  onDoubleClick,
  onMouseDown,
}: {
  keyframe: Keyframe;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const offset = useObservable(keyframe.offset$, keyframe.offset);
  const clampedOffset = Math.max(0, Math.min(1, offset));
  return (
    <div
      className={cx("el-border el-border-fg", {
        "el-border-pm el-ring": active,
      })}
      style={{
        position: "absolute",
        top: 1,
        left: `${clampedOffset * 100}%`,
        width: "12px",
        height: "12px",
        backgroundColor: "white",
        borderWidth: "2px",
        borderRadius: "50%",
        cursor: "pointer",
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
    />
  );
};
const KeyframeSlider = ({
  keyframeSet,
  activeKeyframe,
  onActiveKeyframeChange,
}: {
  keyframeSet: KeyFrameSet;
  activeKeyframe: Keyframe | undefined;
  onActiveKeyframeChange: (keyframe: Keyframe) => void;
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const keyFrames = useObservable(
    keyframeSet.keyframes$,
    keyframeSet.keyframes,
  );

  const handleAddKeyframe = (event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offset = (event.clientX - rect.left) / rect.width;
    keyframeSet.addKeyframe({ offset });
  };
  const handleKeyframeMouseDown = (
    event: React.MouseEvent,
    keyframe: Keyframe,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    if (activeKeyframe !== keyframe) {
      onActiveKeyframeChange(keyframe);
    }

    const handleMouseMove = (event: MouseEvent) => {
      const offset = (event.clientX - rect.x) / rect.width;
      console.log({
        offset,
        clientX: event.clientX,
        rectX: rect.x,
        rectWidth: rect.width,
      });
      keyframe.setOffset(offset);
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
  const handleKeyFrameDoubleClick = (
    event: React.MouseEvent,
    keyframe: Keyframe,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    keyframeSet.removeKeyframe(keyframe);
  };
  const handleKeyframeClick = (event: React.MouseEvent, keyframe: Keyframe) => {
    event.preventDefault();
    event.stopPropagation();
    onActiveKeyframeChange(keyframe);
  };

  return (
    <div className="el-px-2 el-py-2">
      <div
        ref={trackRef}
        style={{
          position: "relative",
          height: 2,
          backgroundColor: "currentColor",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={handleAddKeyframe}
      >
        {keyFrames.map((keyframe) => (
          <KeyframeHandle
            keyframe={keyframe}
            key={keyframe.key}
            active={activeKeyframe === keyframe}
            onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe)}
            onDoubleClick={(e) => handleKeyFrameDoubleClick(e, keyframe)}
            onClick={(e) => handleKeyframeClick(e, keyframe)}
          />
        ))}
      </div>
    </div>
  );
};

export function KeyframeSetEditor({
  keyframeSetId,
}: {
  keyframeSetId: string;
}): JSX.Element {
  const keyframeSet = useProjectKeyframeSet(keyframeSetId);
  const [activeKeyframe, setActiveKeyFrame] = useState<Keyframe | undefined>(
    undefined,
  );

  if (!keyframeSet) {
    return (
      <>
        <div className="el-p-4 el-text-fg-500 el-text-center">
          No keyframe set found
        </div>
      </>
    );
  }

  const styles = activeKeyframe ? [activeKeyframe.style] : [];

  return (
    <ControlMenuAffinityProvider affinity="side">
      <div
        className="el-h-full el-flex el-flex-col el-pt-1"
        style={{
          width: 260,
          height: "calc(100vh - 200px)",
          margin: -12,
        }}
      >
        <ColumnControlContainer>
          <p>Keyframes</p>
          <KeyframeSlider
            keyframeSet={keyframeSet}
            activeKeyframe={activeKeyframe}
            onActiveKeyframeChange={setActiveKeyFrame}
          />
          <FullControlEntry label="Active Frame">
            <SpinnerControl
              value$={activeKeyframe?.offset$}
              value={activeKeyframe?.offset}
              onChange={(value) => activeKeyframe?.setOffset(value ?? 0)}
              settings={{
                round: 2,
                step: 0.01,
                suffix: "%",
              }}
            />
          </FullControlEntry>
        </ColumnControlContainer>

        <hr />
        <div className="el-grow el-overflow-hidden">
          <ScrollArea scrollY>
            {sections.map((section, index) => (
              <React.Fragment key={section.title}>
                {index > 0 && <hr />}
                <Sheet title={section.title}>
                  <StylePropertiesControlSheet
                    styles={styles}
                    properties={section.properties}
                  />
                </Sheet>
              </React.Fragment>
            ))}
            <hr />
            <Sheet title="Effects">
              <StyleEffectsControlSheet styles={styles} />
            </Sheet>
          </ScrollArea>
        </div>
      </div>
    </ControlMenuAffinityProvider>
  );
}
