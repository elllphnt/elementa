import {
  Typeface,
  TypefaceData,
  TypefaceDefinition,
  TypefaceManager,
} from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Elll } from "../../../elll/elll";
import { mimeTypes } from "../../constants/mime_types";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";

const typefaceFilePath = ".elll/typefaces.json";

export type TypefaceStoreData = {
  typefaces?: TypefaceData[];
};

export class ElllTypefaceManager extends Disposable implements TypefaceManager {
  readonly project: ElllProject;
  readonly persitor: Persistor<TypefaceStoreData>;

  private _typefaces$ = new BehaviorSubject<Record<string, Typeface>>({});

  get elll(): Elll {
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

  get data$(): Observable<TypefaceStoreData> {
    return combineLatestOrEmpty([
      this._typefaces$.pipe(
        switchMap((typefaces) =>
          combineLatestOrEmpty(
            Object.values(typefaces).map((typeface) => typeface.data$),
          ),
        ),
      ),
    ]).pipe(
      map(([typefaces]) => ({
        typefaces,
      })),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.persitor = new Persistor<TypefaceStoreData>({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(typefaceFilePath, {
          type: mimeTypes.json,
        }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(typefaceFilePath, {
          type: mimeTypes.json,
        }),
    });

    // Restore data
    const restoreSubscription = this.persitor.data$.subscribe((data) =>
      this.restore(data),
    );
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      this.persitor.save(data);
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this.persitor.dispose();
      this.typefaces.forEach((typeface) => typeface.dispose());

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
        data.typefaces.map((typefaceData) => [typefaceData._id, typefaceData]),
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
