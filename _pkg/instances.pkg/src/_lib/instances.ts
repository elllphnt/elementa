import { Entity } from "@repo/elementa-models";
import { updateMapList } from "@repo/utils";
import { Instance } from "../instances/_";

export function updateInstanceList<E extends Entity, I extends Instance<E>>({
  instances,
  entities,
  createInstance,
}: {
  instances: I[];
  entities: E[];
  createInstance: (entity: E) => I;
}): I[] {
  return updateMapList({
    targets: instances,
    sources: entities,
    ref: (instance) => instance.entity,
    create: createInstance,
    dispose: (instance) => instance.dispose(),
  });
}
