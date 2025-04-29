import { Element } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance, InstanceType } from "../instance";
import { StyleSheetInstance } from "../stylesheet/stylesheet";

export abstract class ElementInstance<
  E extends Element = Element
> extends Instance {
  readonly environment: FragmentEnvironment;
  readonly element: E;
  readonly stylesheet: StyleSheetInstance;

  get parentElement(): ElementInstance | undefined {
    return this.parent?.type === InstanceType.Element
      ? (this.parent as ElementInstance)
      : undefined;
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      type: InstanceType.Element,
      runtime: environment.runtime,
      parent,
    });

    this.environment = environment;
    this.element = element;
    this.stylesheet = new StyleSheetInstance({
      stylesheet: element.cssStyleSheet.stylesheet,
      runtime: environment.runtime,
      cascadeResolver: {
        getParentStylesheetInstance: () => this.parentElement?.stylesheet,
      },
    });

    this.addDisposer(() => {
      this.stylesheet.dispose();
    });
  }
}
