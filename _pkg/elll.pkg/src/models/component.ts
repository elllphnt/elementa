import { ComponentData } from "@elllphnt/elll-element";
import { elllFileTypes } from "@elllphnt/utils";
import { Component } from "@repo/elementa-models";
import { Observable, map, of } from "rxjs";
import { IElll } from "~/src/types/elll";
import { fileColor, fileIcon } from "../components/ui/icons/file_icon";
import { stripEmpty } from "../libs/utils";
import { getElllElementaInfrastrcture } from "../modules/elementa/infrastructure/_lib";
import { ElllElementaProject } from "../modules/elementa/project/project";
import { Content } from "../modules/elll/content/content";
import { ModelConstructor } from "../modules/elll/model/contructor";
import { Model } from "../modules/elll/model/model";

export class ComponentModel extends Component implements Model {
  static key = 0;
  readonly key = ComponentModel.key++;

  readonly elll: IElll;
  readonly url: string;

  get content(): Content<ComponentData> | undefined {
    return this.elll.contentManager.content(this.url, "json");
  }

  get name(): string {
    return this.content?.name ?? "";
  }
  get name$(): Observable<string> {
    return this.content?.name$.pipe(map((name) => name ?? "")) ?? of("");
  }

  get icon(): string {
    return fileIcon(elllFileTypes.component);
  }
  get icon$(): Observable<string> {
    return of(fileIcon(elllFileTypes.component));
  }

  get color(): string {
    return fileColor(elllFileTypes.component);
  }
  get color$(): Observable<string> {
    return of(fileColor(elllFileTypes.component));
  }

  get loading() {
    return !this.content?.loaded;
  }
  get loading$() {
    return this.content?.loaded$.pipe(map((loaded) => !loaded)) ?? of(true);
  }

  get loaded() {
    return this.content?.loaded ?? false;
  }
  get loaded$() {
    return this.content?.loaded$ ?? of(false);
  }

  constructor({ url, elll }: { url: string; elll: IElll }) {
    const infrastructure = getElllElementaInfrastrcture({ elll });
    const project = infrastructure.fileSystem.getFileProject(
      url,
    ) as ElllElementaProject;
    super({ id: url, project });
    this.url = url;
    this.elll = elll;

    let syncing = false;
    // load the component data
    const dataSubscription = this.content?.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore({
          ...data,
          _id: this.id,
        });
      } finally {
        syncing = false;
      }
    });
    // save the component data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.content?.update(stripEmpty(data));
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      dataSubscription?.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }
}

export const componentModelConstructor: ModelConstructor = {
  name: "elll.model.component",
  new: ({ elll, url }) => new ComponentModel({ elll, url }),
};
