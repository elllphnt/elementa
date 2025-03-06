import { CodeComponentElementRenderable } from "@repo/elementa-renderer";
import { IHandle } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { ComponentElementHandle } from "./component";

export class CodeComponentElementHandle extends ComponentElementHandle<CodeComponentElementRenderable> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: CodeComponentElementRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      fragment,
      parent,
    });
  }
}
