import { elementaStandardPaths } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { toAbsoluteFileUrl, toRelativeFileUrl } from "~/_lib/url.js";
import { Infrastructure } from "../infrastructure/infrastructure.js";
import { Content } from "./file/_.js";
import { File, FileReference } from "./file/file.js";
import { FileModelType, fileModelTypes } from "./file/file_types.js";
import {
  FileModelAdaptor,
  FileReferenceModelAdaptor,
} from "./file/model_adaptor.js";
import { StyleManager } from "./style_manager/style_manager.js";

export abstract class Project<F extends File = File> {
  id: string;
  readonly infrastructure: Infrastructure;
  readonly styleManager: StyleManager;

  app = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.app,
    }),
    modelType: fileModelTypes.app,
  });

  styleSystem = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.styleSystem,
    }),
    modelType: fileModelTypes.styleSystem,
  });

  modifierSheet = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.styleModifiers,
    }),
    modelType: fileModelTypes.styleModifierSheet,
  });

  typefaceSheet = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.typefaces,
    }),
    modelType: fileModelTypes.typefaceSheet,
  });

  variableSheet = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.styleVariables,
    }),
    modelType: fileModelTypes.styleVariableSheet,
  });

  keyframeSheet = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.keyframes,
    }),
    modelType: fileModelTypes.keyframeSheet,
  });

  packageSheet = new FileReferenceModelAdaptor({
    fileReference: new FileReference({
      project: this,
      path: elementaStandardPaths.packages,
    }),
    modelType: fileModelTypes.packageSheet,
  });

  abstract file(id: string): F;
  abstract fileModelAdaptor<T extends FileModelType>(
    modelType: T,
    fileId: string
  ): FileModelAdaptor<T, F>;

  abstract fileAtPath(path: string): File | undefined;
  abstract fileAtPath$(path: string): Observable<File | undefined>;

  abstract content(fileId: string): Content<F>;

  component(id: string) {
    return this.fileModelAdaptor(fileModelTypes.component, id);
  }
  router(id: string) {
    return this.fileModelAdaptor(fileModelTypes.router, id);
  }
  stylesheet(id: string) {
    return this.fileModelAdaptor(fileModelTypes.stylesheet, id);
  }

  constructor({
    id,
    infrastructure,
  }: {
    id: string;
    infrastructure: Infrastructure;
  }) {
    this.id = id;
    this.infrastructure = infrastructure;
    this.styleManager = new StyleManager({ project: this });
  }

  absoluteFileUrl(url: string): string {
    return toAbsoluteFileUrl({ url, projectId: this.id });
  }
  relativeFileUrl(url: string): string {
    return toRelativeFileUrl({ url, projectId: this.id });
  }
}
