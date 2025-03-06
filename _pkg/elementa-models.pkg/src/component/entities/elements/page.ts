import { PageElementData, entityTypes } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { Observable, map } from "rxjs";
import { Component } from "../../component";
import { Element } from "./element";

export class PageElement extends Element<PageElementData> {
  get data(): PageElementData {
    return {
      ...super._data,
    } as PageElementData;
  }
  get data$(): Observable<PageElementData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([data]) => ({
        ...data,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.elements.page, component });
  }

  restore(data: PageElementData) {
    super.restore(data);
  }
}
