import {
  Typeface,
  TypefaceData,
  TypefaceDefinition,
  TypefaceManager,
} from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import _ from "lodash";
import {
  BehaviorSubject,
  debounceTime,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";

const typefaceFilePath = ".elll/typefaces";

export type TypefaceStoreData = {
  typefaces?: TypefaceData[];
};

export class ElllTypefaceManager extends Disposable implements TypefaceManager {
  readonly project: ElllProject;

  private _typefaces$ = new BehaviorSubject<Record<string, Typeface>>({});

  get elll(): IElll {
    return this.project.elll;
  }

  get typefaces(): Typeface[] {
    return Object.values(this._typefaces$.value);
  }
  get typefaces$(): Observable<Typeface[]> {
    return this._typefaces$
      .asObservable()
      .pipe(map((typefaces) => Object.values(typefaces)));
  }
  typeface(id: string): Typeface | undefined {
    return this._typefaces$.value[id];
  }
  typeface$(id: string): Observable<Typeface | undefined> {
    return this._typefaces$.pipe(map((typefaces) => typefaces[id]));
  }

  get file() {
    return elllFileAtPath(this.elll, typefaceFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, typefaceFilePath, {
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

  get data(): TypefaceStoreData {
    return {
      typefaces: this.typefaces.map((typeface) => typeface.data),
    };
  }
  get data$() {
    return combineLatestOrEmpty([this.typefaces$]).pipe(
      map(([typefaces]) => {
        return {
          typefaces: typefaces.map((typeface) => typeface.data),
        };
      }),
    );
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
        this.model?.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this._typefaces$.next({});
      this._typefaces$.complete();
    });
  }

  addTypeface(typeface: Typeface) {
    this._typefaces$.next({
      ...this._typefaces$.value,
      [typeface.id]: typeface,
    });
  }
  removeTypeface(typeface: Typeface) {
    const typefaces = { ...this._typefaces$.value };
    delete typefaces[typeface.id];
    this._typefaces$.next(typefaces);
  }

  installFonts(definition: TypefaceDefinition, variants: string[]) {
    let typeface = this.typefaces.find(
      (typeface) => typeface.definition?.family === definition.family,
    );

    if (!typeface) {
      typeface = new Typeface({ project: this.project });
      typeface.setDefinition(definition);
      this.addTypeface(typeface);
    }

    typeface.setVariants(_.uniq([...typeface.variants, ...variants]));
  }
  uninstallFonts(
    typefaceIdOdefinition: string | TypefaceDefinition,
    variants: string[],
  ) {
    let typeface: Typeface | undefined;

    if (typeof typefaceIdOdefinition === "string") {
      typeface = this.typeface(typefaceIdOdefinition);
    } else {
      typeface = this.typefaces.find(
        (typeface) =>
          typeface.definition?.family === typefaceIdOdefinition.family,
      );
    }

    if (typeface) {
      typeface.setVariants(
        typeface.variants.filter((variant) => !variants.includes(variant)),
      );
    }

    if (typeface?.variants.length === 0) {
      this.removeTypeface(typeface);
    }
  }

  restore(data: TypefaceStoreData) {
    restoreReactiveMap({
      datafiable$: this._typefaces$,
      data: Object.fromEntries(
        data.typefaces?.map((typefaceData) => [
          typefaceData._id,
          typefaceData,
        ]) ?? [],
      ) as Record<string, TypefaceData>,
      create: (typefaceData) =>
        new Typeface({
          id: typefaceData._id,
          project: this.project,
        }),
      restore: (typeface, typefaceData) => typeface.restore(typefaceData),
      dispose: (typeface) => typeface.dispose(),
    });
  }
}
