import { useObservable } from "@elllphnt/elementa-react-utils";
import type { ComponentHandle } from "~/handles/renderables/component.js";
import type { RenderableContentHandle } from "~/handles/renderables/content.js";
import type { FragmentHandle } from "~/handles/renderables/fragment.js";
import { ComponentHandleComponent } from "./component.js";
import { FragmentHandleComponent } from "./fragment.js";
import { RouterHandleComponent } from "./router.js";

export function RenderableContentHandleComponent({
  content,
}: {
  content: RenderableContentHandle;
}) {
  const contentHandle = useObservable(content.content$, content.content);

  if (!contentHandle) {
    return <></>;
  }

  switch (content.renderable.instance.model.type) {
    case "component":
      return (
        <ComponentHandleComponent
          key={contentHandle.key}
          component={contentHandle as ComponentHandle}
        />
      );
    case "fragment":
      return (
        <FragmentHandleComponent
          key={contentHandle.key}
          fragment={contentHandle as FragmentHandle}
        />
      );
    case "router":
      return <RouterHandleComponent key={contentHandle.key} />;
    default:
      console.warn(
        `Unknown content type: ${
          (contentHandle.renderable.instance.model as any).type
        }`
      );
      return null;
  }
}
