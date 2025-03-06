import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import { generateProjectFeatures } from "~/src/libs/ai_generation/features/generate_project_features";
import { organizeFeatures } from "~/src/libs/ai_generation/features/organize_features";
import { getElllephantApiClient } from "~/src/libs/ai_generation/utils";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";
import { Domain } from "./domain";
import { Feature } from "./feature";
import { Spec } from "./spec";

const specFilePath = ".elll/spec";

export class ElllSpec extends Spec {
  readonly project: ElllProject;

  private _generatingFeatures$ = new BehaviorSubject<boolean>(false);
  private _organizingFeatures$ = new BehaviorSubject<boolean>(false);

  get elll(): IElll {
    return this.project.elll;
  }

  get file() {
    return elllFileAtPath(this.elll, specFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, specFilePath, {
      type: mimeTypes.json,
    });
  }

  get model() {
    return this.file
      ? this.elll.modelManager.getModel(
          jsonModelConstructor.name,
          this.file.url,
        )
      : undefined;
  }
  get model$() {
    return this.file$.pipe(
      map((file) =>
        file
          ? this.elll.modelManager.getModel(jsonModelConstructor.name, file.url)
          : undefined,
      ),
    );
  }

  get contentData$() {
    return this.model$.pipe(
      switchMap((model) => (model ? model.content.data$ : of({}))),
    );
  }
  get contentData() {
    return this.model?.content.data ?? {};
  }

  get loaded$() {
    return this.model$.pipe(
      switchMap((model) => model?.content.loaded$ ?? of(false)),
    );
  }
  get loaded() {
    return this.model?.content.loaded ?? false;
  }

  get loading$() {
    return combineLatest([this.model$, this.file$]).pipe(
      switchMap(([model, file]) => {
        return model?.content.loading$ ?? of(!file);
      }),
    );
  }
  get loading() {
    return this.model?.content.loading ?? !this.file;
  }

  get generatingFeatures$() {
    return this._generatingFeatures$.asObservable();
  }
  get generatingFeatures() {
    return this._generatingFeatures$.value;
  }

  get organizingFeatures$() {
    return this._organizingFeatures$.asObservable();
  }
  get organizingFeatures() {
    return this._organizingFeatures$.value;
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    let syncing = false;
    // Restore data
    const restoreSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        console.log("spec data restore", this.model?.key, data);
        this.restore(data);
      } finally {
        syncing = false;
      }
    });
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        console.log("spec data save", this.model?.key, data);
        this.model?.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  async generateFeatures() {
    if (this.generatingFeatures) {
      return;
    }

    this._generatingFeatures$.next(true);
    try {
      const client = getElllephantApiClient(this.elll);
      const type = this.type;
      const description = this.description;

      if (!type || !description) {
        this.elll.shell.notificationManager.showNotification({
          title: "Failed to generate features",
          message: "Type and description are required to generate features.",
        });
        return;
      }

      const features = (
        await generateProjectFeatures({
          client,
          type,
          description,
        })
      ).map((data) => {
        const feature = new Feature();
        feature.restore(data);
        return feature;
      });

      features.forEach((feature) => {
        this.addFeature(feature);
      });
    } finally {
      this._generatingFeatures$.next(false);
    }
  }
  async organizeFeatures() {
    if (this.organizingFeatures) {
      return;
    }

    this._organizingFeatures$.next(true);
    try {
      const client = getElllephantApiClient(this.elll);
      const type = this.type;
      const description = this.description;

      if (!type || !description) {
        this.elll.shell.notificationManager.showNotification({
          title: "Failed to organize features",
          message: "Type and description are required to organize features.",
        });
        return;
      }

      const result = await organizeFeatures({
        client,
        type,
        description,
        domains: this.domains.map((domain) => domain.data),
        features: this.featuresByDomain().map((feature) => feature.data), // only the unassigned features
      });

      for (const domainData of result.newDomains) {
        const domain = new Domain();
        domain.restore(domainData);
        this.addDomain(domain);
      }
      for (const assignment of result.assignments) {
        this.moveFeature(assignment.featureId, undefined, [
          assignment.domainId,
          0,
        ]);
      }
    } finally {
      this._organizingFeatures$.next(false);
    }
  }

  async addFeatureFromDescription(description: string) {}
  async addDomainFromDescription(description: string) {}
}
