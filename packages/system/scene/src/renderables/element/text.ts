import { TextElementInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject, of } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { ElementRenderable } from "./element.js";

export interface ITextElementEditor {
  mount(htmlElement: HTMLElement): void;
  unmount(): void;
  selectAll(): void;
}

export class TextElementRenderable extends ElementRenderable<TextElementInstance> {
  private _editor: ITextElementEditor | undefined;
  private _mode$ = new BehaviorSubject<"view" | "edit">("view");
  private _editorHtmlElement$ = new BehaviorSubject<HTMLElement | undefined>(
    undefined
  );

  get editor() {
    return this._editor;
  }

  get renderables() {
    return [];
  }
  get renderables$() {
    return of([]);
  }

  get mode$() {
    return this._mode$;
  }
  get mode() {
    return this._mode$.value;
  }

  get editorHtmlElement$() {
    return this._editorHtmlElement$;
  }
  get editorHtmlElement() {
    return this._editorHtmlElement$.value;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: TextElementInstance;
  }) {
    super({ scene, instance });

    // mount/unmount editor when editorHtmlElement changes
    const editorHtmlElementSubscription = this.editorHtmlElement$.subscribe(
      (htmlElement) => {
        if (htmlElement) {
          this.editor?.mount(htmlElement);
        } else {
          this.editor?.unmount();
        }
      }
    );

    this.addDisposer(() => {
      editorHtmlElementSubscription.unsubscribe();
    });
  }

  setMode(mode: "view" | "edit") {
    this._mode$.next(mode);
  }
  setEditorHtmlElement(htmlElement: HTMLElement | undefined | null) {
    this._editorHtmlElement$.next(htmlElement ?? undefined);
  }
  setEditor(editor: ITextElementEditor | undefined) {
    this._editor = editor;
  }
}
