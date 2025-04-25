import { ComponentElementRenderable } from "@repo/elementa-renderer";
import { updateMapList } from "@repo/utils";
import { BehaviorSubject } from "rxjs";
import { IHandle, ILayoutUpdatePropagation } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { LayoutUpdatePropagation } from "../../handle_rect";
import { FragmentHandle } from "../fragment";
import { ElementHandle } from "./element";

export class ComponentElementHandle<
  R extends ComponentElementRenderable = ComponentElementRenderable,
> extends ElementHandle<R> {
  readonly _template$ = new BehaviorSubject<FragmentHandle | undefined>(
    undefined,
  );

  get template$() {
    return this._template$.asObservable();
  }
  get template() {
    return this._template$.value;
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: R;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      fragment,
      parent,
    });

    this.addEventListener("dblclick", () => {
      const url = this.entity.standardComponentUrl;
      if (!url) return;
      // this.editor.host.goTo(url);
    });

    // update layout on props change
    const propsSubscription = this.entity.props$.subscribe(() => {
      setTimeout(() => {
        this.handleLayoutUpdate({
          propagation: new LayoutUpdatePropagation(),
        });
      });
    });

    const templateSubscription = this.renderable.template$.subscribe(
      (fragment) => {
        const [newTemplate] = updateMapList({
          sources: fragment ? [fragment] : [],
          targets: this.template ? [this.template] : [],
          create: (fragment) =>
            new FragmentHandle({
              renderable: fragment,
              interactor: this.interactor,
              parent: this,
              useSlots: true,
            }),
          ref: (handle) => handle.renderable,
          dispose: (handle) => handle.dispose(),
        });

        this._template$.next(newTemplate);
      },
    );

    this.addDisposer(() => {
      propsSubscription.unsubscribe();
      templateSubscription.unsubscribe();
      this._template$.complete();
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation | undefined;
  }): void {
    super.handleLayoutUpdate({ propagation });

    this.template?.handleLayoutUpdate({ propagation });
  }
}
