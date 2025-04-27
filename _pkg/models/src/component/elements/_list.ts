import { combineLatestOrEmpty, CRDTModelList } from "@elllphnt/elementa-utils";
import _ from "lodash";
import { map, switchMap } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { IdentifiableModel } from "../identifiable";
import { createElement } from "./_create";
import { Element } from "./element";

export class ElementList extends CRDTModelList<Element> {
  get allCssStylesheets() {
    return [...this.items.flatMap((e) => e.allCssStylesheets)];
  }
  get allCssStylesheets$() {
    return this.items$.pipe(
      switchMap((elements) =>
        combineLatestOrEmpty(
          elements.map((element) => element.allCssStylesheets$)
        )
      ),
      map((elements) => _.flatten(elements))
    );
  }

  constructor(ymap: y.Array<y.Map<any>>, component: Component) {
    super(ymap, (map) => createElement(map, component));
  }

  cloneIds(yarray: y.Array<y.Map<any>>) {
    IdentifiableModel.cloneIdentifiableListIds(this.items, yarray);
  }
}
