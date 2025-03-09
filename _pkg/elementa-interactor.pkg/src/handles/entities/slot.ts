import { entityTypes } from "@elllphnt/elll-element";
import {
  FragmentInstance,
  SlotRenderable,
  Stylesheet,
} from "@repo/elementa-stager";
import { BehaviorSubject, Observable } from "rxjs";
import { makeEntityDropType } from "~/src/_lib/droptypes";
import { makeElementHandle, updateEntityHandleList } from "~/src/_lib/handles";
import { IElementHandle, ILayoutUpdatePropagation } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { IHandle } from "~/src/_types/handles/handle";
import { handleProperties, handleTypes } from "~/src/handles/_";
import { StylableHandle } from "./stylable";

export class SlotHandle extends StylableHandle<SlotRenderable> {
  readonly fragment: IFragmentHandle;
  private _children$ = new BehaviorSubject<IElementHandle[]>([]);

  get children(): IElementHandle[] {
    return this._children$.value;
  }
  get children$(): Observable<IElementHandle[]> {
    return this._children$.asObservable();
  }

  get contextSelector(): string {
    return (this.fragment.instance as FragmentInstance).environment.selector;
  }
  get contextSelector$(): Observable<string> {
    return (this.fragment.instance as FragmentInstance).environment.selector$;
  }

  instanceStyle(selector: string) {
    return this.instance.style;
  }
  get entityStylesheet(): Stylesheet | undefined {
    return this.instance.style.stylesheet;
  }
  get entityStylesheet$(): Observable<Stylesheet | undefined> {
    return this.instance.style.stylesheet$;
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: SlotRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      interactor: fragment.interactor,
      type: handleTypes.slot,
      parent,
      allowedDropTypes: [makeEntityDropType(entityTypes.element), "text/plain"],
    });
    this.fragment = fragment;

    this.setProperty(handleProperties.canResize, true);
    this.setProperty(handleProperties.hasCorner, true);
    this.setProperty(handleProperties.hasPadding, true);

    const childrenSubscription = this.renderable.content$.subscribe(
      (children) => {
        const newHandles = updateEntityHandleList({
          handles: this.children,
          renderables: children,
          create: (renderable) =>
            makeElementHandle({
              renderable,
              fragment: this.fragment,
              parent: this,
            }),
        });

        this._children$.next(newHandles);
      },
    );

    this.watchStyle();

    this.addDisposer(() => {
      this._children$.complete();
      childrenSubscription.unsubscribe();
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation;
  } = {}): void {
    console.log("SlotHandle.handleLayoutUpdate", { propagation });
    super.handleLayoutUpdate({ propagation });
  }
}
