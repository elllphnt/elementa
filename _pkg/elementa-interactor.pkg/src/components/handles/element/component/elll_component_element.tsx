import { useObservable } from "@repo/utils";
import { ElllComponentElementHandle } from "~/src/handles/_";
import { FragmentHandleComponent } from "../../fragment";

export function ElllComponentElementHandleComponent({
  element,
}: {
  element: ElllComponentElementHandle;
}) {
  const template = useObservable(element.template$, element.template);

  if (!template) {
    return <></>;
  }

  return <FragmentHandleComponent fragment={template} />;
}
