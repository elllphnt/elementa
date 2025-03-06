import {
  DurationControl,
  FullControlEntry,
  NumberControl,
  resolveCommonValue,
  SelectControl,
  TextControl,
} from "@repo/components";
import { AnimationData, Style, StyleData } from "@repo/elementa";
import { InstanceStyle } from "@repo/elementa/dist/elementa/style/style";
import { useManyObservables } from "@repo/utils";
import { map } from "rxjs";

export function AnimationMenu({
  styles,
  animationKey,
}: {
  styles: InstanceStyle[];
  animationKey: string;
}) {
  const animations = (useManyObservables(
    styles.map((style) =>
      style
        .resolvedPropertyValue$("animations")
        .pipe(
          map((animations) =>
            animations?.find((animation) => animation.key === animationKey),
          ),
        ),
    ),
    styles.map((style) =>
      style
        .resolvedPropertyValue("animations")
        ?.find((animation) => animation.key === animationKey),
    ),
    styles.map((style) => style.key).join(",") + animationKey,
  ).filter(Boolean) ?? []) as AnimationData[];

  const commonKeyframe = resolveCommonValue(
    animations.map((animation) => animation.keyframe),
  );
  const commonDuration = resolveCommonValue(
    animations.map((animation) => animation.duration),
  );
  const commonTimingFunction = resolveCommonValue(
    animations.map((animation) => animation.timingFunction),
  );
  const commonDelay = resolveCommonValue(
    animations.map((animation) => animation.delay),
  );
  const commonIterationCount = resolveCommonValue(
    animations.map((animation) => animation.iterationCount),
  );
  const commonDirection = resolveCommonValue(
    animations.map((animation) => animation.direction),
  );
  const commonFillMode = resolveCommonValue(
    animations.map((animation) => animation.fillMode),
  );
  const commonPlayState = resolveCommonValue(
    animations.map((animation) => animation.playState),
  );

  const setValue = (updater: (animation: AnimationData) => AnimationData) => {
    styles.forEach((style) => {
      const animations = style.resolvedPropertyValue("animations");
      const newAnimations = animations?.map((animation) => {
        if (animation.key === animationKey) {
          return updater(animation);
        }
        return animation;
      });
      style.setProperty("animations", newAnimations);
    });
  };

  return (
    <>
      <FullControlEntry label="Duration">
        <DurationControl
          value={commonDuration}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, duration: value as any }));
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Timing Function">
        <TextControl
          value={commonTimingFunction}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, timingFunction: value }));
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Delay">
        <DurationControl
          value={commonDelay}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, delay: value as any }));
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Iteration Count">
        <NumberControl
          value={commonIterationCount}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, iterationCount: value }));
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Direction">
        <SelectControl
          value={commonDirection}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, direction: value }));
          }}
          settings={{
            options: [
              { value: "normal", label: "Normal" },
              { value: "reverse", label: "Reverse" },
              { value: "alternate", label: "Alternate" },
              { value: "alternate-reverse", label: "Alternate Reverse" },
            ],
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Fill Mode">
        <SelectControl
          value={commonFillMode}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, fillMode: value }));
          }}
          settings={{
            options: [
              { value: "none", label: "None" },
              { value: "forwards", label: "Forwards" },
              { value: "backwards", label: "Backwards" },
              { value: "both", label: "Both" },
            ],
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Play State">
        <SelectControl
          value={commonPlayState}
          onChange={(value) => {
            setValue((animation) => ({ ...animation, playState: value }));
          }}
          settings={{
            options: [
              { value: "running", label: "Running" },
              { value: "paused", label: "Paused" },
            ],
          }}
        />
      </FullControlEntry>
    </>
  );
}
