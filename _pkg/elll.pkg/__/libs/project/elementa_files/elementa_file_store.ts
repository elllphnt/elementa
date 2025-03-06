import { makeFidUrl } from "@elllphnt/utils";
import { Entity, entityTypes, VectorElement } from "@repo/elementa";
import { map } from "rxjs";
import { EditorFile } from "../../../editors/content";
import { VectorElementContentFile } from "../../elementa/file";
import { parseElementaEntityUrl } from "../../elementa/uris";
import { ElllProject } from "../project";

export class EntityFileStore {
  readonly project: ElllProject;

  private _files: Record<string, EditorFile> = {};

  getFileOrCreate(key: string, create: () => EditorFile) {
    let file = this._files[key];
    if (!file) {
      file = create();
      this._files[key] = file;
    }
    return file;
  }

  vectorElementFile(element: VectorElement, part?: string) {
    switch (part) {
      case "content": {
        let key = `vector-element-content|${element.component.id}/${element.id}`;
        return this.getFileOrCreate(key, () => {
          return new VectorElementContentFile({ element });
        });
      }
    }
  }
  resolveFileFromEntity(entity: Entity, part?: string) {
    switch (entity?.type) {
      case entityTypes.elements.vector:
        return this.vectorElementFile(entity as VectorElement, part);
    }
  }

  file(url: string) {
    const { componentId, entityId, part } = parseElementaEntityUrl(url);
    const component = this.project.componentStore.component(
      makeFidUrl({ id: componentId }),
    );
    const entity = component.entity(entityId);
    if (!entity) return;
    return this.resolveFileFromEntity(entity, part);
  }
  file$(url: string) {
    const { componentId, entityId, part } = parseElementaEntityUrl(url);
    const component = this.project.componentStore.component(
      makeFidUrl({ id: componentId }),
    );
    return component.entity$(entityId).pipe(
      map((entity) => {
        if (!entity) return;
        return this.resolveFileFromEntity(entity, part);
      }),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    this.project = project;
  }
}
