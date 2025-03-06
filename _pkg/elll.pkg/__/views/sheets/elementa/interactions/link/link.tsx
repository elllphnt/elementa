import { BaseControlType, elllIcons16, useAction } from "@repo/components";
import { ElementInstance } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { EvaluableControlEntry } from "../../../../../components/controls/infrastructure/evaluable/evaluable";

export function LinkSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const instance = instances[0];
  const link = useObservable(instance.entity.link$, instance.entity.link);

  useAction(
    {
      title: link ? "Remove Link" : "Add Link",
      icon: link ? elllIcons16.minus : elllIcons16.plus,
      handler: () => {
        if (link) {
          instance.entity.setLink(undefined);
        } else {
          instance.entity.setLink({});
        }
      },
    },
    [link],
  );

  if (!link) {
    return <></>;
  }

  return (
    <>
      <EvaluableControlEntry
        label="href"
        control={BaseControlType.Text}
        value={link.href}
        onChange={(value) => {
          instance.entity.setLink({ ...link, href: value });
        }}
      />
    </>
  );
}
