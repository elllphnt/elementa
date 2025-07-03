import type { Observable } from "rxjs";
import { of } from "rxjs";
import type { ElementaInteractor } from "~/interactor.js";
import { Handle } from "./handle.js";

export class FallbackHandle extends Handle {
  constructor({
    interactor,
    parent,
  }: {
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({
      interactor,
      id: "fallback",
      parent,
    });
  }

  contentHtmlElement(): HTMLElement | undefined {
    return undefined;
  }
  contentHtmlElement$(): Observable<HTMLElement | undefined> {
    return of(undefined);
  }

  get content(): Handle[] {
    return [];
  }
  get content$(): Observable<Handle[]> {
    return of([]);
  }

  delete(): void {
    console.warn("Cannot delete fallback handle");
  }
}
