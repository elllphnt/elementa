import { StyleModifierData } from "@elllphnt/elll-element";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

export type ColorSchemeData = {
  name: string;
  modifiers: StyleModifierData[];
};

export class ColorSchemeManager extends Disposable {
  // Hold all color schemes and a lookup by name.
  private _colorSchemes$ = new BehaviorSubject<ColorSchemeData[]>([]);
  private _colorSchemeByName$ = new BehaviorSubject<
    Record<string, ColorSchemeData>
  >({});

  constructor() {
    super();
    const nameSubscription = this._colorSchemes$.subscribe((schemes) => {
      this._colorSchemeByName$.next(
        Object.fromEntries(schemes.map((scheme) => [scheme.name, scheme])),
      );
    });
    this.addDisposer(() => {
      nameSubscription.unsubscribe();
    });
  }

  // Expose current color schemes and observable.
  get colorSchemes() {
    return this._colorSchemes$.value;
  }
  get colorSchemes$(): Observable<ColorSchemeData[]> {
    return this._colorSchemes$.asObservable();
  }

  // Helper to get a scheme by name.
  colorScheme(name: string): ColorSchemeData {
    return this._colorSchemeByName$.value[name];
  }
  colorScheme$(name: string): Observable<ColorSchemeData | undefined> {
    return this._colorSchemeByName$.pipe(map((schemes) => schemes[name]));
  }

  // Color-scheme–related modifiers.
  modifiers({ colorScheme }: { colorScheme: string }): any[] {
    const scheme = this.colorScheme(colorScheme);
    return scheme ? scheme.modifiers : [];
  }
  modifiers$({ colorScheme }: { colorScheme: string }): Observable<any[]> {
    return this.colorScheme$(colorScheme).pipe(
      map((scheme) => (scheme ? scheme.modifiers : [])),
    );
  }

  restore(schemes: ColorSchemeData[]): void {
    this._colorSchemes$.next(schemes);
  }
}
