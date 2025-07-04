import type { PackageData } from "@elllphnt/elementa-base";
import {
  elementaStandardPaths,
  toAbsoluteFileUrl,
  toRelativeFileUrl,
} from "@elllphnt/elementa-base";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import type { Infrastructure } from "../infrastructure/infrastructure.js";
import type { FileModelTypeName } from "../models/types.js";
import { fileModelTypes } from "../models/types.js";
import type { Content } from "./file/content.js";
import type { File } from "./file/file.js";
import { FileReference } from "./file/file.js";
import type { FileModelAdaptor } from "./file/model_adaptor.js";
import { FileReferenceModelAdaptor } from "./file/model_adaptor.js";
import { PackageManager } from "./package_manager/package_manager.js";
import { StyleManager } from "./style_manager/style_manager.js";

export abstract class Project<F extends File = File> extends Lifecycle {
  id: string;
  readonly infrastructure: Infrastructure;
  readonly styleManager: StyleManager;
  readonly packageManager: PackageManager;

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
  abstract fileModelAdaptor<T extends FileModelTypeName>(
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
    super();
    this.id = id;
    this.infrastructure = infrastructure;
    this.styleManager = new StyleManager({ project: this });
    this.packageManager = new PackageManager({ project: this });

    this.addInitializer(() => {
      this.styleManager.initialize();
      this.packageManager.initialize();

      this.app.fileReference.initialize();
      this.styleSystem.fileReference.initialize();
      this.modifierSheet.fileReference.initialize();
      this.typefaceSheet.fileReference.initialize();
      this.variableSheet.fileReference.initialize();
      this.keyframeSheet.fileReference.initialize();
      this.packageSheet.fileReference.initialize();

      this.app.initialize();
      this.styleSystem.initialize();
      this.modifierSheet.initialize();
      this.typefaceSheet.initialize();
      this.variableSheet.initialize();
      this.keyframeSheet.initialize();
      this.packageSheet.initialize();

      this.addDisposer(() => {
        this.styleManager.dispose();
        this.packageManager.dispose();

        this.app.fileReference.dispose();
        this.styleSystem.fileReference.dispose();
        this.modifierSheet.fileReference.dispose();
        this.typefaceSheet.fileReference.dispose();
        this.variableSheet.fileReference.dispose();
        this.keyframeSheet.fileReference.dispose();
        this.packageSheet.fileReference.dispose();

        this.app.dispose();
        this.styleSystem.dispose();
        this.modifierSheet.dispose();
        this.typefaceSheet.dispose();
        this.variableSheet.dispose();
        this.keyframeSheet.dispose();
        this.packageSheet.dispose();
      });
    });
  }

  absoluteFileUrl(url: string): string {
    return toAbsoluteFileUrl({ url, projectId: this.id });
  }
  relativeFileUrl(url: string): string {
    return toRelativeFileUrl({ url, projectId: this.id });
  }

  abstract installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]>;
}
