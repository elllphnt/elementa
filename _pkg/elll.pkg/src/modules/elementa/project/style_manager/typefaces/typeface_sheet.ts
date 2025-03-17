import { TypefaceData, typefaceToCSS } from "@elllphnt/elll-element";
import { CssStyleSheet, TextCssStyleSheet } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, map, Observable } from "rxjs";
import { genId } from "~/src/libs/id";
import { jsonModelConstructor } from "~/src/models/json";
import { SynchronizedModelFile } from "../../file";
import { IElllStyleManager } from "../_types";
import { ITypefaceSheet } from "./_types";

export type StyleTypefaceSheetData = {
  typefaces?: TypefaceData[];
};

export class TypefaceSheet
  extends SynchronizedModelFile<StyleTypefaceSheetData>
  implements ITypefaceSheet
{
  readonly stylesheet: CssStyleSheet;

  private _typefacesById$ = new BehaviorSubject<
    Record<string, TypefaceData & { id: string }>
  >({});
  private _cssText$ = new BehaviorSubject<string>("");

  get typefaces() {
    return Object.values(this._typefacesById$.value);
  }
  get typefaces$() {
    return this._typefacesById$
      .asObservable()
      .pipe(map((typefaces) => Object.values(typefaces)));
  }

  typeface(id: string) {
    return this._typefacesById$.value[id];
  }
  typeface$(id: string) {
    return this._typefacesById$.pipe(map((typefaces) => typefaces[id]));
  }

  get data(): StyleTypefaceSheetData {
    return {
      typefaces: this.typefaces,
    };
  }
  get data$(): Observable<StyleTypefaceSheetData> {
    return combineLatestOrEmpty([this.typefaces$]).pipe(
      map(([typefaces]) => ({
        typefaces,
      })),
    );
  }

  get sourceData$(): Observable<StyleTypefaceSheetData> {
    return this._modelSourceData$.pipe(
      map(
        (data) =>
          data ?? {
            typefaces: [],
          },
      ),
    );
  }

  constructor({ styleManager }: { styleManager: IElllStyleManager }) {
    super({
      elll: styleManager.elll,
      drive: styleManager.drive,
      path: ".elll/typefaces",
      model: jsonModelConstructor.name,
    });
    this.watchData();
    this.addDisposer(() => {
      this._typefacesById$.complete();
    });

    this.stylesheet = new TextCssStyleSheet({
      target: "typefaces",
      text: () => this._cssText$.value,
      text$: () => this._cssText$.asObservable(),
    });

    const cssSubscription = this.typefaces$.subscribe((typefaces) => {
      const csss = typefaces.map((typeface) => typefaceToCSS(typeface));
      this._cssText$.next(csss.join("\n"));
    });

    this.addDisposer(() => {
      cssSubscription.unsubscribe();
    });
  }

  private _setTypefaces(typefaces: Record<string, TypefaceData>) {
    const curatedTypefaces: Record<string, TypefaceData & { id: string }> = {};

    for (const [id, typeface] of Object.entries(typefaces)) {
      if (!typeface.variants?.length) {
        continue;
      }
      if (!typeface.name) {
        typeface.name = _.camelCase(typeface.definition?.family) || "";
      }
      curatedTypefaces[id] = { ...typeface, id };
    }

    this._typefacesById$.next(curatedTypefaces);
  }

  addTypeface(typeface: TypefaceData) {
    const id = typeface.id || genId();
    this._setTypefaces({
      ...this._typefacesById$.value,
      [id]: { ...typeface, id },
    });
    return id;
  }
  removeTypeface(id: string) {
    const typefaces = { ...this._typefacesById$.value };
    delete typefaces[id];
    this._setTypefaces(typefaces);
  }

  installFonts(id: string, variants: string[]) {
    let typeface = this.typeface(id);
    if (!typeface) {
      console.error(`Typeface not found: ${id}`);
      return;
    }
    typeface = {
      ...typeface,
      variants: [...new Set([...(typeface.variants ?? []), ...variants])],
    };
    this._setTypefaces({
      ...this._typefacesById$.value,
      [id]: typeface,
    });
  }
  uninstallFonts(id: string, variants: string[]) {
    let typeface = this.typeface(id);
    if (!typeface) {
      console.error(`Typeface not found: ${id}`);
      return;
    }

    typeface = {
      ...typeface,
      variants: typeface.variants?.filter((v) => !variants.includes(v)),
    };

    this._setTypefaces({
      ...this._typefacesById$.value,
      [id]: typeface,
    });
  }

  restore(data: StyleTypefaceSheetData) {
    this._setTypefaces(
      Object.fromEntries(
        data.typefaces?.map((typeface) => {
          const id = typeface.id || genId();
          return [id, { ...typeface, id }];
        }) ?? [],
      ),
    );
  }
}
