import { baseSelector, StyleSheetData } from "@elllphnt/elementa-base";
import { assert, CRDTModelMap, MapCRDTModel } from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { Style } from "./style";
import { StyleFragmentRegistry } from "./style_fragment_registry";

/**
 * A standalone modelization of an Elll StylesheetData object.
 * Can be used to store and manipulate stylesheet data.
 */
export class Stylesheet extends MapCRDTModel<StyleSheetData> {
  readonly project: Project;
  readonly fragmentRegistry: StyleFragmentRegistry;
  readonly styles: CRDTModelMap<Style>;

  get className() {
    return `elll-stylesheet-${this.key}`;
  }

  style<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? Style : Style | undefined {
    let style = this.styles.item(selector);
    if (!style && create) {
      this.addStyle(selector);
      style = this.styles.item(selector);
      assert(style, "Style not defined after insertion");
    }
    return style;
  }
  style$<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? Observable<Style> : Observable<Style | undefined> {
    return this.styles.item$(selector).pipe(
      tap((style) => {
        if (!style) {
          this.addStyle(selector);
        }
      }),
      filter((style) => !!style || !create)
    );
  }

  get conditions$() {
    return this.state$.pipe(map((s) => s.conditions));
  }
  get conditions() {
    return this.state.conditions;
  }

  condition(id: string): string | undefined {
    return this.conditions[id];
  }
  condition$(id: string): Observable<string | undefined> {
    return this.conditions$.pipe(map((conditions) => conditions[id]));
  }

  get selectors() {
    return Object.keys(this.styles);
  }
  get selectors$() {
    return this.styles.items$.pipe(map((styles) => Object.keys(styles)));
  }

  baseStyle<C extends true | undefined>(
    create?: C
  ): C extends true ? Style : Style | undefined {
    return this.style(baseSelector, create) as any;
  }
  baseStyle$<C extends true | undefined>(
    create?: C
  ): C extends true ? Observable<Style> : Observable<Style | undefined> {
    return this.style$(baseSelector, create) as any;
  }

  constructor(ymap: y.Map<any>, project: Project) {
    super(ymap);
    this.project = project;
    this.fragmentRegistry = new StyleFragmentRegistry(
      this.getOrCreateArray("fragments")
    );
    this.styles = new CRDTModelMap(
      this.getOrCreateMap("styles"),
      (map) => new Style(map, project, this.fragmentRegistry)
    );

    this.addDisposer(() => {
      this.fragmentRegistry.dispose();
      this.styles.dispose();
    });
  }

  addStyle(selector: string) {
    const existing = this.styles.item(selector);
    if (existing) {
      return;
    }
    this.styles.set(selector, new y.Map());
  }
  removeStyle(selector: string) {
    const existing = this.styles.item(selector);
    if (!existing) {
      return;
    }
    this.styles.delete(selector);
  }

  setCondition(id: string, expression: string): void {
    const conditions = { ...this.conditions };
    conditions[id] = expression;
    this.patch({ conditions });
  }
  removeCondition(id: string) {
    const conditions = { ...this.conditions };
    delete conditions[id];
    this.patch({ conditions });
  }
}
