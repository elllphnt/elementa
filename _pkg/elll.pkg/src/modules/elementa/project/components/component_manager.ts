import { Component, ComponentManager } from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import {
  ComponentModel,
  componentModelConstructor,
} from "~/src/models/component";
import { IElll } from "~/src/types/elll";

export class ElllComponentManager
  extends Disposable
  implements ComponentManager
{
  elll: IElll;

  component(url: string): Component {
    return this.elll.modelManager.getModel(
      componentModelConstructor.name,
      url,
    ) as ComponentModel;
  }

  constructor({ elll }: { elll: IElll }) {
    super();
    this.elll = elll;
  }

  createComponent(): Promise<Component | undefined> {
    throw new Error("Method not implemented.");
  }
}
