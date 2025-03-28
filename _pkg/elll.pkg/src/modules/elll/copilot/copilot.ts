import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { IElll } from "~/src/types/elll";
import { AiGeneration } from "./generation";

export class Copilot {
  readonly elll: IElll;

  private _generations$ = new BehaviorSubject<AiGeneration[]>([]);

  get generations() {
    return this._generations$.value;
  }
  get generations$() {
    return this._generations$.asObservable();
  }

  get activeGenerations() {
    return this.generations.filter(
      (generation) =>
        generation.status === "running" || generation.status === "idle",
    );
  }
  get activeGenerations$() {
    return this.generations$.pipe(
      switchMap((generations) =>
        combineLatestOrEmpty(
          generations.map((generation) =>
            generation.status$.pipe(
              map((status) => [generation, status] as const),
            ),
          ),
        ),
      ),
      map((generations) =>
        generations.filter(
          ([, status]) => status === "running" || status === "idle",
        ),
      ),
      map((generations) => generations.map(([generation]) => generation)),
    );
  }

  constructor({ elll }: { elll: IElll }) {
    this.elll = elll;
  }

  generateResources({ path, query }: { path: string; query: string }) {
    const generation = new AiGeneration({ elll: this.elll, path, query });
    this._generations$.next([...this._generations$.value, generation]);
    generation.run();

    return generation;
  }
}
