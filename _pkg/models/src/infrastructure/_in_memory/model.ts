import { Enhancer, ReactiveMap, updateYMap } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { FileModel } from "../file/_";
import { InMemoryFile } from "./file";

export class InMemoryFileModel<
  M extends ReactiveMap<any>
> extends FileModel<M> {
  doc: y.Doc;
  map: y.Map<any>;

  constructor({
    file,
    enhancer,
    enhance,
    doc,
  }: {
    file: InMemoryFile;
    enhancer: Enhancer<y.Map<any>, M>;
    enhance: Enhancer<y.Map<any>, M>;
    doc: y.Doc;
  }) {
    super({
      file,
      enhancer,
      enhance,
    });
    this.doc = doc;
    this.map = this.doc.getMap();
    const contentSubscription = this.file.content$.subscribe((content) => {
      let data: any;
      try {
        data = JSON.parse(content);
      } catch (error) {
        data = {};
      }
      updateYMap(this.map, data);
      this.setModel(this.map);
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
    });
  }
}
