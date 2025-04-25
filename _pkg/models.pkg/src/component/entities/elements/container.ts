import { ContainerElementData, entityTypes } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { map, Observable } from "rxjs";
import { Component } from "../../component";
import { ElementElementContainer } from "./_common/container";

export class ContainerElement extends ElementElementContainer<ContainerElementData> {
  get data(): ContainerElementData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<ContainerElementData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([data]) => ({
        ...data,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      type: entityTypes.elements.container,
      component,
    });
  }
}
