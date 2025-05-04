import { Enhancer, ReactiveMap, updateYMap } from "@elllphnt/elementa-utils";
import { combineLatest } from "rxjs";
import * as y from "yjs";
import { FileModel } from "../file/_";
import { InMemoryFile } from "./file";

export class InMemoryFileModel<
  M extends ReactiveMap<unknown>
> extends FileModel<M> {
  doc: y.Doc;

  constructor({
    file,
    enhancer,
    enhance,
    doc,
  }: {
    file: InMemoryFile;
    enhancer: Enhancer<y.Map<unknown>, M>;
    enhance: Enhancer<y.Map<unknown>, M>;
    doc: y.Doc;
  }) {
    super({
      file,
      enhancer,
      enhance,
    });
    this.doc = doc;
    const contentSubscription = combineLatest([
      this.file.content$,
      this.file.isResolved$,
    ]).subscribe(([content, isResolved]) => {
      if (isResolved) {
        const map = this.doc.getMap("" + Math.random());
        let data: unknown;
        try {
          data = JSON.parse(content);
        } catch {
          data = {};
        }

        updateYMap(map, data);
        this.setModel(map);
      } else {
        this.clearModel();
      }
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
    });
  }
}
