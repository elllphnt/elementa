import { BehaviorSubject, map, Observable, of } from "rxjs";
import { makeEntityDropType } from "~/_lib/droptypes";
import { makeElementHandle, updateEntityHandleList } from "~/_lib/handles";
import { IElementHandle, ILayoutUpdatePropagation } from "~/_types/_";
import { DropOptions, Handle } from "~/_types/handles/handle";
import { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import { handleProperties, handleTypes } from "~/handles/_";
import { StylableHandle } from "./_stylable.js";

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
    return "(this.fragment.instance as FragmentInstance).environment.selector";
  }
  get contextSelector$(): Observable<string> {
    return of(
      "(this.fragment.instance as FragmentInstance).environment.selector$"
    );
  }

  instanceStyle(selector: string) {
    return this.instance.style(selector);
  }
  get cssStyleSheet(): StylesheetCssStyleSheet | undefined {
    return this.instance.fill?.cssStyleSheet;
  }
  get cssStyleSheet$(): Observable<StylesheetCssStyleSheet | undefined> {
    return this.instance.fill$.pipe(map((fill) => fill?.cssStyleSheet));
  }

  get entityStylesheet(): Stylesheet | undefined {
    return this.instance.fill?.stylesheet;
  }
  get entityStylesheet$(): Observable<Stylesheet | undefined> {
    return this.instance.fill$.pipe(map((fill) => fill?.stylesheet));
  }

  getStyledHtmlElement(): HTMLElement | undefined {
    return this.renderable.htmlElement(Renderable.defaultHtmlElementKey);
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: SlotRenderable;
    fragment: IFragmentHandle;
    parent: Handle | null;
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
      }
    );

    this.watchStyle();
    this.watchCssStyleSheet();

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
    super.handleLayoutUpdate({ propagation });

    this.children.forEach((child) => child.handleLayoutUpdate({ propagation }));
  }

  handleEntityDrop(entities: Entity[], options?: DropOptions): Handle[] {
    let elements: Element[] = [];
    entities.forEach((entity) => {
      if (entity === this.entity) {
        return;
      }
      switchEntityType(entity.type, {
        [entityTypes.element]: () => {
          elements.push(entity as Element);
        },
      });
    });

    if (options?.index !== undefined) {
      this.instance.fill?.insertElements(options.index, ...elements);
    } else {
      this.instance.fill?.appendElements(...elements);
    }

    const handles = elements
      .map((element) => this.entityHandle(element))
      .filter(Boolean) as IElementHandle[];

    return handles;
  }
}
