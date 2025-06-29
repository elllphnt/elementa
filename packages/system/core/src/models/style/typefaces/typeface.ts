import { TypefaceData, TypefaceDefinition } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { genId } from "~/_lib/id.js";
import { Identifiable } from "~/models/_.js";

export class Typeface extends Identifiable<TypefaceData> {
  get name(): string {
    return this.state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this.state.entry$("name").pipe(map((name) => name || ""));
  }

  get definition(): TypefaceDefinition | undefined {
    return this.state.entry("definition");
  }

  get definition$(): Observable<TypefaceDefinition | undefined> {
    return this.state.entry$("definition");
  }

  get variants(): string[] {
    return this.state.entry("variants") || [];
  }

  get variants$(): Observable<string[]> {
    return this.state
      .entry$("variants")
      .pipe(map((variants) => variants || []));
  }

  constructor({
    state,
    initialized,
  }: {
    state: RecordState<TypefaceData>;
    initialized?: boolean;
  }) {
    super({ state });

    if (!initialized) {
      state.set("id", genId());
    }

    this.addDisposer(() => {
      this.state.dispose();
    });
  }

  setName(name: string): void {
    this.state.set("name", name);
  }

  setDefinition(definition: TypefaceDefinition): void {
    this.state.set("definition", definition);
  }

  setVariants(variants: string[]): void {
    this.state.set("variants", variants);
  }
}
