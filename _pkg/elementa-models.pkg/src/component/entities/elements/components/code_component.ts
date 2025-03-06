import { entityTypes } from "@elllphnt/elll-element";
import { of, switchMap } from "rxjs";
import { Component } from "../../../component";
import { ComponentElement } from "./component";

export class CodeComponentElement extends ComponentElement {
  get componentName() {
    if (!this.standardComponentUrl) return undefined;
    return this.project.infrastructure.fileSystem.fileName(
      this.standardComponentUrl,
    );
  }
  get componentName$() {
    return this.standardComponentUrl$.pipe(
      switchMap((url) => {
        return url
          ? this.project.infrastructure.fileSystem.fileName$(url)
          : of(undefined);
      }),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.elements.components.code, component });
  }
}
