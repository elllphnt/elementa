import {
  ColorSchemeDefinitionData,
  genId,
  StyleModifierData,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "@elllphnt/elementa-base";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { Project } from "../project.js";

export function colorSchemeSystemDefinitions(): ColorSchemeDefinitionData[] {
  return [
    {
      name: "light",
      modifiers: [
        {
          name: "ligth",
        },
      ],
      __crdtAtomic: ["modifiers[*]"],
    },
    {
      name: "dark",
      modifiers: [
        {
          name: "dark",
        },
      ],
      __crdtAtomic: ["modifiers[*]"],
    },
  ];
}
export function colorSchemeSystemModifiers(): StyleModifierDefinitionData[] {
  return [
    {
      id: genId(),
      name: "light",
      type: StyleModifierType.Context,
      selector: ["@media (prefers-color-scheme: light)"],
      __crdtAtomic: ["signature", "selector"],
    },
    {
      id: genId(),
      name: "dark",
      type: StyleModifierType.Context,
      selector: ["@media (prefers-color-scheme: dark)"],
      __crdtAtomic: ["signature", "selector"],
    },
  ];
}

export class ColorSchemeManager extends Lifecycle {
  project: Project;

  systemDefinitions = colorSchemeSystemDefinitions();
  systemModifiers = colorSchemeSystemModifiers();

  private _colorSchemeByName$ = new BehaviorSubject<
    Record<string, ColorSchemeDefinitionData>
  >({});

  get styleSystem() {
    return this.project.styleSystem.model;
  }
  get styleSystem$() {
    return this.project.styleSystem.model$;
  }

  get modifiers() {
    const source = this.styleSystem?.colorSchemes.source;
    if (source === "definitions") {
      return [];
    } else {
      return this.systemModifiers;
    }
  }
  get modifiers$() {
    return this.styleSystem$.pipe(
      switchMap((system) => system?.colorSchemes.source$ ?? of(undefined)),
      switchMap((source) => {
        if (source === "definitions") {
          return of([]);
        } else {
          return of(this.systemModifiers);
        }
      })
    );
  }

  get colorSchemes() {
    const source = this.styleSystem?.colorSchemes.source;
    if (source === "definitions") {
      return this.styleSystem?.colorSchemes.definitions || [];
    } else {
      return this.systemDefinitions || [];
    }
  }
  get colorSchemes$(): Observable<ColorSchemeDefinitionData[]> {
    return this.styleSystem$.pipe(
      switchMap((system) =>
        combineLatest({
          source: system?.colorSchemes.source$ ?? of(undefined),
          colorSchemes: of(system?.colorSchemes),
        })
      ),
      switchMap(({ source, colorSchemes }) => {
        if (source === "definitions") {
          return colorSchemes?.definitions$ || of([]);
        } else {
          return of(this.systemDefinitions);
        }
      })
    );
  }

  colorScheme(name: string): ColorSchemeDefinitionData | undefined {
    return this._colorSchemeByName$.value[name];
  }
  colorScheme$(
    name: string
  ): Observable<ColorSchemeDefinitionData | undefined> {
    return this._colorSchemeByName$.pipe(map((schemes) => schemes[name]));
  }

  colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[] {
    const scheme = this.colorScheme(colorScheme);
    return scheme?.modifiers || [];
  }
  colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]> {
    return this.colorScheme$(colorScheme).pipe(
      map((scheme) => scheme?.modifiers || [])
    );
  }

  constructor({ project }: { project: Project }) {
    super();
    this.project = project;
  }

  async initialize() {
    const nameSubscription = this.colorSchemes$.subscribe((schemes) => {
      this._colorSchemeByName$.next(
        Object.fromEntries(schemes.map((scheme) => [scheme.name, scheme]))
      );
    });
    this.addDisposer(() => {
      nameSubscription.unsubscribe();
    });
  }
}
