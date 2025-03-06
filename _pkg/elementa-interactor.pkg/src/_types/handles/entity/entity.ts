import { InstanceRenderable } from "@repo/elementa-renderer";
import { IHandle } from "../handle";

export interface IEntityHandle<
  R extends InstanceRenderable = InstanceRenderable,
> extends IHandle {
  readonly renderable: R;
  readonly entity: R["instance"]["entity"];
  readonly instance: R["instance"];
}
