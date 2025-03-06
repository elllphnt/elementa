import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { KeyFrameSet } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useProjectKeyframeSets } from "../../../../hooks/project/keyframe_set";
import { ElllProject } from "../../../../libs/project/project";

function KeyframeEntry({
  keyframe,
  onClick,
}: {
  keyframe: KeyFrameSet;
  onClick: () => void;
}) {
  const name = useObservable(keyframe?.name$, keyframe?.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.appearances} />}
      onClick={onClick}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            (
              keyframe.project as ElllProject
            ).keyframeSetStore.removeKeyframeSet(keyframe);
          },
        },
      ]}
    >
      {name ?? "Animation"}
    </TreeEntry>
  );
}

export function AnimationBrowser({
  onSelect,
}: {
  onSelect: (keyframe: KeyFrameSet) => void;
}) {
  const keyframes = useProjectKeyframeSets();
  return (
    <>
      {keyframes.map((keyframe) => (
        <KeyframeEntry
          key={keyframe.id}
          keyframe={keyframe}
          onClick={() => onSelect(keyframe)}
        />
      ))}
    </>
  );
}
