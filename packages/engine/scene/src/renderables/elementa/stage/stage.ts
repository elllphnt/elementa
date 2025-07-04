import { reconcileList } from "@elllphnt/elementa-kernel";
import { TextCssStyleSheet } from "@elllphnt/elementa-models";
import type { ElementaStageInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import type { Scene } from "../../../scene/scene.js";
import { Renderable } from "../../renderable.js";
import { ElementaFrameRenderable } from "./frame.js";
import type { Theme } from "./stylesheet.js";
import { css } from "./stylesheet.js";
import { StageViewport } from "./viewport.js";

export class ElementaStageRenderable extends Renderable {
  readonly instance: ElementaStageInstance;
  readonly viewport = new StageViewport();
  private _frames$ = new BehaviorSubject<ElementaFrameRenderable[]>([]);
  private _theme$ = new BehaviorSubject<Theme>({
    light: {
      backgroundColor: "#ffffff",
    },
    dark: {
      backgroundColor: "#191919",
    },
  });

  frames$ = this._frames$.asObservable();
  get frames() {
    return this._frames$.value;
  }

  theme$ = this._theme$.asObservable();
  get theme() {
    return this._theme$.value;
  }

  get ready$() {
    return combineLatest({
      height: this.viewport.height$,
      width: this.viewport.width$,
    }).pipe(
      map(({ height, width }) => {
        return height > 0 && width > 0;
      })
    );
  }
  get ready() {
    return this.viewport.height > 0 && this.viewport.width > 0;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ElementaStageInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const framesSubscription = this.instance.frames$.subscribe((frames) => {
      const [nextFrames, removed] = reconcileList({
        sources: frames,
        targets: this.frames,
        sourceRef: (s) => s,
        targetRef: (t) => t.instance,
        create: (instance) =>
          new ElementaFrameRenderable({
            scene,
            instance,
          }),
      });

      this._frames$.next(nextFrames);
      removed.forEach((frame) => frame.dispose());
    });

    const stylesheet = new TextCssStyleSheet({
      target: "stage",
      text: () => css(this.theme),
      text$: () => this.theme$.pipe(map((theme) => css(theme))),
    });
    this.scene.stylesheetDomManager
      .stylesheetAdaptor(stylesheet)
      .useRef(document);

    this.addDisposer(() => {
      framesSubscription.unsubscribe();
      this._frames$.complete();
      this.scene.stylesheetDomManager
        .stylesheetAdaptor(stylesheet)
        .clearRef(document);
    });
  }
}
