import {
  BaseControlType,
  FullControlEntry,
  mixed,
  SelectControl,
  TextControl,
} from "@repo/components";
import {
  ImageMediaContentData,
  isExpression,
  MediaElementInstance,
} from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { EvaluableControlEntry } from "../../../../../../components/controls/infrastructure/evaluable/evaluable";
import { useInstancesCommonReactivePair } from "../../../../../../hooks/utils/reactivity";

function ImageMediaSheet({
  data,
  onChange,
}: {
  data: ImageMediaContentData;
  onChange: (data: ImageMediaContentData) => void;
}): JSX.Element {
  return (
    <>
      <FullControlEntry label="Type">
        <SelectControl
          value={data.type}
          onChange={(value) => {
            if (value) {
              onChange({
                ...data,
                type: value,
              });
            }
          }}
          settings={{
            options: [
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
            ],
          }}
        />
      </FullControlEntry>
      <EvaluableControlEntry
        label="Source"
        control={BaseControlType.Text}
        value={data.src}
        onChange={(value) => {
          onChange({
            ...data,
            src: value,
          });
        }}
      />
    </>
  );
}

function VideoMediaSheet({
  data,
  onChange,
}: {
  data: ImageMediaContentData;
  onChange: (data: ImageMediaContentData) => void;
}): JSX.Element {
  return (
    <>
      <FullControlEntry label="Type">
        <SelectControl
          value={data.type}
          onChange={(value) => {
            if (value) {
              onChange({
                ...data,
                type: value,
              });
            }
          }}
          settings={{
            options: [
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
            ],
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Source">
        <TextControl
          value={data.src as any}
          onChange={(value) => {
            onChange({
              ...data,
              src: value,
            });
          }}
        />
      </FullControlEntry>
    </>
  );
}

export function MediaSheet({
  instances,
}: {
  instances: MediaElementInstance[];
}): JSX.Element {
  const [_content$, _content] = useInstancesCommonReactivePair({
    instances,
    value$: (i) => i.entity.content$,
    value: (i) => i.entity.content,
  });
  const content = useObservable(_content$, _content);

  if (!content || content === mixed) {
    return (
      <>
        <FullControlEntry label="Type">
          <SelectControl
            onChange={(value) => {
              if (value) {
                instances.forEach((instance) => {
                  instance.entity.setContent({
                    type: value,
                  });
                });
              }
            }}
            settings={{
              options: [
                { value: "image", label: "Image" },
                { value: "video", label: "Video" },
              ],
            }}
          />
        </FullControlEntry>
      </>
    );
  } else if (isExpression(content)) {
    return (
      <>
        <EvaluableControlEntry
          control={BaseControlType.Expression}
          label="Source"
          value={_content}
          value$={_content$}
          onChange={(value) => {
            instances.forEach((instance) => {
              instance.entity.setContent(value);
            });
          }}
        />
      </>
    );
  } else if (content.type === "image") {
    return (
      <ImageMediaSheet
        data={content}
        onChange={(data) => {
          instances.forEach((instance) => {
            instance.entity.setContent(data);
          });
        }}
      />
    );
  } else if (content.type === "video") {
    return (
      <VideoMediaSheet
        data={content}
        onChange={(data) => {
          instances.forEach((instance) => {
            instance.entity.setContent(data);
          });
        }}
      />
    );
  } else {
    return (
      <>
        <FullControlEntry label="Type">
          <SelectControl
            value={content.type}
            onChange={(value) => {
              if (value) {
                instances.forEach((instance) => {
                  instance.entity.setContent({
                    ...content,
                    type: value,
                  });
                });
              }
            }}
            settings={{
              options: [
                { value: "image", label: "Image" },
                { value: "video", label: "Video" },
              ],
            }}
          />
        </FullControlEntry>
      </>
    );
  }
}
