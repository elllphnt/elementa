import type { Handle, RenderableHandle } from "~/_types/_";
import type { EntityHandle } from "~/handles/_";

export function duplicateEntityHandles(handles: RenderableHandle[]) {
  // group the handles by their parent
  const handlesByParent = new Map<Handle, RenderableHandle[]>();
  for (const handle of handles) {
    const parent = handle.parent ?? handle.interactor.fallback;
    if (parent) {
      let handles = handlesByParent.get(parent);
      if (!handles) {
        handles = [];
        handlesByParent.set(parent, handles);
      }
      handles.push(handle);
    }
  }

  // duplicate the handles inside their parents
  const newHandles = [...handlesByParent.entries()].flatMap(
    ([parent, handles]) => {
      const index = parent.children.indexOf(handles[0]);
      const clones = handles.map((handle) => handle.entity.clone());
      parent.handleEntityDrop(clones, { index: index + 1 });

      return clones
        .map((entity) => parent.entityHandle(entity))
        .filter(Boolean) as EntityHandle[];
    }
  );

  return newHandles;
}
