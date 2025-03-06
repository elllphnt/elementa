import {
  DurationControl,
  FullControlEntry,
  TextControl,
} from "@repo/components";
import { Transition } from "@repo/elementa";

export function TransitionMenu({ transition }: { transition: Transition }) {
  return (
    <>
      <FullControlEntry label="Name">
        <TextControl
          value$={transition.name$}
          value={transition.name}
          onChange={(name) => {
            transition.setName(name);
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Duration">
        <DurationControl
          value$={transition.duration$}
          value={transition.duration}
          onChange={(duration) => {
            transition.setDuration(duration as any);
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Timing Function">
        <TextControl
          value$={transition.timingFunction$}
          value={transition.timingFunction}
          onChange={(timingFunction) => {
            transition.setTimingFunction(timingFunction);
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Delay">
        <DurationControl
          value$={transition.delay$}
          value={transition.delay}
          onChange={(delay) => {
            transition.setDelay(delay as any);
          }}
        />
      </FullControlEntry>
    </>
  );
}
